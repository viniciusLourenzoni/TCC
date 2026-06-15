import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  pwaTutorialSeen: boolean;
  markPwaTutorialSeen: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      pwaTutorialSeen: false,
      markPwaTutorialSeen: () => set({ pwaTutorialSeen: true }),
    }),
    { name: 'pwa-onboarding' },
  ),
);
