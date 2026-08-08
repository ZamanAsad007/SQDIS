import React from 'react';
import { StaleDataIndicator } from './StaleDataIndicator';

interface StaleDataWrapperProps {
  isStale: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export function StaleDataWrapper({ isStale, onRefresh, children }: StaleDataWrapperProps) {
  return (
    <div className="relative space-y-2">
      {isStale && (
        <div className="flex justify-end">
          <StaleDataIndicator isStale={isStale} onRefresh={onRefresh} />
        </div>
      )}
      {children}
    </div>
  );
}
