import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonStatsGrid, SkeletonTable, SkeletonTabs } from '../BaseSkeletons';

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Header with Date Range Filter */}
      <SkeletonHeader titleWidth={220} actionsCount={2} />

      {/* Tabs for Overview, Content, Audience, Performance */}
      <SkeletonTabs tabCount={4} />

      {/* 4 Metric Cards */}
      <SkeletonStatsGrid count={4} cols={4} />

      {/* Two Main Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width={160} height={20} />
            <Skeleton width={80} height={16} />
          </div>
          <Skeleton width="100%" height={260} className="rounded-xl" />
        </div>

        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width={160} height={20} />
            <Skeleton width={80} height={16} />
          </div>
          <Skeleton width="100%" height={260} className="rounded-xl" />
        </div>
      </div>

      {/* Breakdown Tables (Top Pages & Referrers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton width={140} height={20} />
          <SkeletonTable rows={4} columns={3} />
        </div>
        <div className="space-y-3">
          <Skeleton width={140} height={20} />
          <SkeletonTable rows={4} columns={3} />
        </div>
      </div>
    </div>
  );
}
