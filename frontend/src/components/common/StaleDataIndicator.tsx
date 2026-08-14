interface StaleDataIndicatorProps {
  isStale: boolean;
  onRefresh?: () => void;
}

export function StaleDataIndicator({ isStale, onRefresh }: StaleDataIndicatorProps) {
  if (!isStale) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-xs font-medium">
      <span>Data may be out of date</span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="underline hover:text-amber-300 transition-colors"
        >
          Refresh
        </button>
      )}
    </div>
  );
}
