import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonStatsGrid, SkeletonTable, SkeletonFilterBar } from '../BaseSkeletons';

export function SuperAdminDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={260} actionsCount={2} />
      <SkeletonStatsGrid count={4} cols={4} />

      {/* System Telemetry & Server Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
          <Skeleton width={120} height={18} />
          <Skeleton width="100%" height={160} className="rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
          <Skeleton width={120} height={18} />
          <Skeleton width="100%" height={160} className="rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
          <Skeleton width={120} height={18} />
          <Skeleton width="100%" height={160} className="rounded-xl" />
        </div>
      </div>

      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function ErrorLogsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={3} hasActionButton />
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-red-100 dark:border-red-950/50 bg-red-50/20 dark:bg-red-950/10 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton width={50} height={20} className="rounded-full" />
                <Skeleton width={180} height={16} />
              </div>
              <Skeleton width={80} height={14} />
            </div>
            <Skeleton width="90%" height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CouponManagementSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonStatsGrid count={3} cols={3} />
      <SkeletonFilterBar hasSearch filterCount={1} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function LogViewerSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-gray-950 text-gray-100 shadow-sm font-mono space-y-2.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton width={90} height={14} className="bg-gray-800" />
            <Skeleton width={45} height={14} className="bg-gray-800" />
            <Skeleton width={i % 2 === 0 ? '70%' : '50%'} height={14} className="bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
