import React from 'react';

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-slate-100 rounded"
            style={{ width: `${85 - i * 15}%` }}
          ></div>
        ))}
      </div>
      <div className="pt-2 flex justify-end">
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export const MetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 bg-slate-200 rounded w-20"></div>
            <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
          </div>
          <div className="h-7 bg-slate-200 rounded w-28"></div>
          <div className="h-3 bg-slate-100 rounded w-36"></div>
        </div>
      ))}
    </div>
  );
};
