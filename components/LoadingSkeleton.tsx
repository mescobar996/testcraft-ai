"use client";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="h-3 bg-slate-700 rounded w-16 mb-2"></div>
            <div className="h-6 bg-slate-700 rounded w-10"></div>
          </div>
        ))}
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-2">
        <div className="h-9 bg-slate-800/50 border border-slate-700 rounded-lg w-24"></div>
        <div className="h-9 bg-slate-800/50 border border-slate-700 rounded-lg w-32"></div>
        <div className="h-9 bg-slate-800/50 border border-slate-700 rounded-lg w-28"></div>
      </div>

      {/* Search Skeleton */}
      <div className="h-10 bg-slate-800/50 border border-slate-700 rounded-lg w-full"></div>

      {/* Filter Skeleton */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-800/50 border border-slate-700 rounded-lg w-20"></div>
        ))}
      </div>

      {/* Test Cases Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-4 bg-slate-700 rounded w-12"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 bg-slate-700 rounded w-16"></div>
                <div className="h-5 bg-slate-700 rounded w-14"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-4">
        <div className="h-3 bg-slate-700 rounded w-16 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
      </div>
    </div>
  );
}
