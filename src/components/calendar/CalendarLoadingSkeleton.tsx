import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const CalendarLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Week navigation skeleton */}
      <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Calendar skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-4 w-8 mx-auto" />
              <Skeleton className="h-6 w-6 mx-auto" />
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-1">
              <Skeleton className="h-12 w-12" />
              {[...Array(7)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};