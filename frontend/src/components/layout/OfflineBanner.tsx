import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/lib/sync/useNetworkStatus';

export function OfflineBanner() {
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <div className="bg-payment-fiado/90 text-white text-xs font-semibold py-1.5 px-3 flex items-center gap-1.5 justify-center">
      <WifiOff className="h-3.5 w-3.5" />
      Modo offline — vendas serão sincronizadas quando voltar
    </div>
  );
}
