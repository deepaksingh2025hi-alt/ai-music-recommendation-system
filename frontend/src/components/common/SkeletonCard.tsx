import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col p-3 rounded-2xl glass-card border border-white/[0.04] animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-dark-800/80 mb-3" />
      <div className="h-3.5 bg-dark-750 rounded-md w-3/4 mb-2" />
      <div className="h-3 bg-dark-800 rounded-md w-1/2" />
    </div>
  );
};

export const SkeletonRow: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-dark-800 shrink-0" />
        <div className="space-y-2 flex-1 max-w-xs">
          <div className="h-3 bg-dark-750 rounded w-full" />
          <div className="h-2.5 bg-dark-800 rounded w-2/3" />
        </div>
      </div>
      <div className="w-10 h-3 bg-dark-800 rounded" />
    </div>
  );
};

