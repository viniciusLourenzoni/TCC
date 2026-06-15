import {
  getVapidPublicKey,
  subscribePush,
  deletePushSubscription,
} from '@/lib/api/notifications';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function pushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Pede permissão, assina o Web Push e registra a subscription no backend.
 * Silencioso em caso de falta de suporte, permissão negada ou ausência de
 * chave VAPID — não deve quebrar o carregamento do app.
 */
export async function registerPush(): Promise<void> {
  if (!pushSupported()) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const publicKey = await getVapidPublicKey();
  if (!publicKey) return;

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const json = sub.toJSON();
  await subscribePush({
    endpoint: sub.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    },
  });
}

/** Cancela a subscription local e remove do backend (usar no logout). */
export async function unregisterPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await deletePushSubscription(sub.endpoint).catch(() => undefined);
      await sub.unsubscribe().catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
}

/** Notificação local (sem servidor) — usada para eventos de conexão. */
export function showLocalNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  const options = { body, icon: '/icons/icon-192.png' };
  try {
    new Notification(title, options);
  } catch {
    // Em mobile o construtor falha; usa o service worker
    navigator.serviceWorker?.ready
      .then((reg) => reg.showNotification(title, options))
      .catch(() => undefined);
  }
}
