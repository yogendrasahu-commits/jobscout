import React from 'react';

export const SkeletonCard = ({ type = 'job', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
        >
          {/* Header Row: Badges & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-16 h-5 rounded-lg skeleton-shimmer" />
              <div className="w-12 h-5 rounded-lg skeleton-shimmer" />
            </div>
            <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
          </div>

          {/* Title & Avatar Row */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl skeleton-shimmer flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="w-3/4 h-4 rounded-md skeleton-shimmer" />
              <div className="w-1/2 h-3 rounded-md skeleton-shimmer" />
            </div>
          </div>

          {/* Salary & Location Row */}
          <div className="flex items-center justify-between py-1">
            <div className="w-24 h-6 rounded-xl skeleton-shimmer" />
            <div className="w-16 h-6 rounded-xl skeleton-shimmer" />
          </div>

          {/* Content Lines */}
          <div className="space-y-2 pt-1">
            <div className="w-full h-3 rounded-md skeleton-shimmer" />
            <div className="w-5/6 h-3 rounded-md skeleton-shimmer" />
          </div>

          {/* Footer Skills & Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-12 h-4 rounded-md skeleton-shimmer" />
              <div className="w-14 h-4 rounded-md skeleton-shimmer" />
              <div className="w-10 h-4 rounded-md skeleton-shimmer" />
            </div>
            <div className="w-20 h-7 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
};
