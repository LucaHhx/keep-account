import { WifiOff } from 'lucide-react';
import { useNetworkStore } from '../stores/network';

export default function NetworkBanner() {
  const isOnline = useNetworkStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>当前无网络连接，请联网后使用</span>
    </div>
  );
}
