import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'video' | 'stats';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        );

      case 'stats':
        return (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-800 rounded animate-pulse w-1/3" />
              <div className="w-8 h-8 bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 bg-slate-800 rounded animate-pulse w-1/2 mb-2" />
            <div className="h-3 bg-slate-800 rounded animate-pulse w-1/4" />
          </div>
        );

      case 'video':
        return (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="aspect-video bg-slate-800 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-slate-800 rounded animate-pulse w-2/3" />
              <div className="flex gap-2 mt-4">
                <div className="h-9 bg-slate-800 rounded-lg animate-pulse flex-1" />
                <div className="h-9 w-9 bg-slate-800 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        );

      case 'card':
      default:
        return (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-800 rounded animate-pulse w-2/3" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-1/3" />
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-1/4" />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
