import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
}) => {
  const variantClass = 
    variant === 'circular' ? 'rounded-full' :
    variant === 'rounded' ? 'rounded-xl' : 'rounded-none';

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-700/60 ${variantClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12" variant="rounded" />
          <div className="space-y-1.5">
            <Skeleton className="w-36 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
        <Skeleton className="w-20 h-6" variant="rounded" />
      </div>

      <div className="space-y-2 pt-1">
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-4/5 h-3" />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Skeleton className="w-16 h-5" variant="rounded" />
        <Skeleton className="w-20 h-5" variant="rounded" />
        <Skeleton className="w-24 h-5 ml-auto" variant="rounded" />
      </div>
    </div>
  );
};

export const CandidateCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" variant="circular" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-20 h-2.5" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="w-12 h-4" variant="rounded" />
        <Skeleton className="w-16 h-4" variant="rounded" />
        <Skeleton className="w-14 h-4" variant="rounded" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-20 h-6" variant="rounded" />
      </div>
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-5 h-5" variant="rounded" />
      </div>
      <Skeleton className="w-20 h-6" />
      <Skeleton className="w-32 h-2.5" />
    </div>
  );
};
