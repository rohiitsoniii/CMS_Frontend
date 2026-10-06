import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonFilterBar,
  SkeletonCardGrid,
  SkeletonTable,
  SkeletonTabs,
} from '../BaseSkeletons';

export function ProjectsListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonCardGrid count={6} />
    </div>
  );
}

export function ProjectOverviewSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Project Banner & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton variant="rounded" width={56} height={56} className="rounded-2xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton width={180} height={26} />
              <Skeleton width={64} height={20} className="rounded-full" />
            </div>
            <Skeleton width={260} height={16} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={100} height={40} className="rounded-xl" />
          <Skeleton width={120} height={40} className="rounded-xl" />
        </div>
      </div>

      {/* KPI Stats */}
      <SkeletonStatsGrid count={4} cols={4} />

      {/* 2-Column Overview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton width={160} height={22} />
              <Skeleton width={80} height={16} />
            </div>
            <Skeleton width="100%" height={220} className="rounded-xl" />
          </div>
          <SkeletonTable rows={4} columns={4} />
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 shadow-sm space-y-4">
            <Skeleton width={140} height={20} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                  <Skeleton variant="circular" width={32} height={32} />
                  <div className="flex-1 space-y-1">
                    <Skeleton width="80%" height={14} />
                    <Skeleton width="40%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectShellSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      {/* Shell Nav Header */}
      <div className="border-b border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton width={36} height={36} className="rounded-xl" />
            <div className="space-y-1">
              <Skeleton width={130} height={18} />
              <Skeleton width={90} height={12} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={36} height={36} />
          </div>
        </div>
        <div className="mt-4">
          <SkeletonTabs tabCount={5} />
        </div>
      </div>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonStatsGrid count={3} cols={3} />
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

export function ContentSectionSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader titleWidth={200} hasSubtitle={false} actionsCount={1} />
      <SkeletonFilterBar />
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}
