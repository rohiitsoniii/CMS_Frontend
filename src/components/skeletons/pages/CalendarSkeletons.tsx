import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonFilterBar, SkeletonStatsGrid, SkeletonTable } from '../BaseSkeletons';

export function ContentCalendarSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Calendar Header with Month/Week navigation & controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200/70 dark:border-gray-800/80">
        <div className="flex items-center gap-3">
          <Skeleton width={180} height={32} className="rounded-lg" />
          <div className="flex items-center gap-1">
            <Skeleton width={36} height={36} className="rounded-lg" />
            <Skeleton width={36} height={36} className="rounded-lg" />
          </div>
          <Skeleton width={60} height={32} className="rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200/70 dark:border-gray-800/80 p-1 gap-1">
            <Skeleton width={60} height={28} className="rounded" />
            <Skeleton width={60} height={28} className="rounded" />
            <Skeleton width={60} height={28} className="rounded" />
          </div>
          <Skeleton width={120} height={38} className="rounded-lg" />
        </div>
      </div>

      {/* 7-column Calendar Grid */}
      <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/80 overflow-hidden bg-white/60 dark:bg-gray-900/60 shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200/70 dark:border-gray-800/80 bg-gray-50/70 dark:bg-gray-800/40">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((_, idx) => (
            <div key={idx} className="p-3 text-center border-r border-gray-200/50 dark:border-gray-800/50 last:border-0">
              <Skeleton width={40} height={16} className="mx-auto" />
            </div>
          ))}
        </div>

        {/* 5-week days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200/60 dark:divide-gray-800/60">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[110px] p-2 space-y-2 bg-transparent">
              <div className="flex justify-between items-center">
                <Skeleton width={20} height={16} />
              </div>
              {i % 3 === 0 && (
                <div className="p-1.5 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 space-y-1">
                  <Skeleton width="85%" height={12} />
                  <Skeleton width="50%" height={10} />
                </div>
              )}
              {i % 5 === 0 && (
                <div className="p-1.5 rounded bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 space-y-1">
                  <Skeleton width="75%" height={12} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContentSchedulesSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonStatsGrid count={3} cols={3} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}
