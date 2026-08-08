import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function ConnectivityBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="bg-rose-600 text-white text-center py-1.5 px-4 text-xs font-semibold fixed top-0 left-0 right-0 z-50 shadow-md">
      You are currently offline. Some features may be unavailable and data will sync once restored.
    </div>
  );
}
