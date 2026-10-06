import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonStatsGrid, SkeletonTable, SkeletonTabs, SkeletonCardGrid } from '../BaseSkeletons';

export function SeoDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonStatsGrid count={4} cols={4} />

      {/* SEO Health Card & Issues Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm flex flex-col items-center justify-center space-y-4">
          <Skeleton variant="circular" width={140} height={140} />
          <Skeleton width={120} height={20} />
          <Skeleton width={180} height={14} />
        </div>
        <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <Skeleton width={160} height={20} />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton width={140} height={16} />
                  <Skeleton width={90} height={12} />
                </div>
                <Skeleton width={60} height={24} className="rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

export function SiteAuditSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />

      {/* Progress & Audit Overview */}
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton width={180} height={20} />
          <Skeleton width={80} height={16} />
        </div>
        <Skeleton width="100%" height={12} className="rounded-full" />
        <div className="grid grid-cols-3 gap-4 pt-2">
          <Skeleton height={40} className="rounded-lg" />
          <Skeleton height={40} className="rounded-lg" />
          <Skeleton height={40} className="rounded-lg" />
        </div>
      </div>

      {/* Audit Categories */}
      <SkeletonCardGrid count={6} />
    </div>
  );
}

export function KeywordTrackerSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={240} actionsCount={2} />
      <SkeletonStatsGrid count={3} cols={3} />
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <Skeleton width={150} height={20} />
        <Skeleton width="100%" height={200} className="rounded-xl" />
      </div>
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

export function SitemapSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70">
        <div className="space-y-1">
          <Skeleton width={160} height={18} />
          <Skeleton width={260} height={14} />
        </div>
        <Skeleton width={120} height={36} className="rounded-lg" />
      </div>
      <SkeletonTable rows={6} columns={4} />
    </div>
  );
}

export function RobotsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
          <Skeleton width={140} height={18} />
          <Skeleton width={80} height={32} className="rounded-lg" />
        </div>
        <Skeleton width="100%" height={280} className="rounded-xl font-mono" />
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton width={100} height={40} className="rounded-lg" />
          <Skeleton width={120} height={40} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SchemaSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonTabs tabCount={3} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <Skeleton width={140} height={20} />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton width={100} height={14} />
                <Skeleton width="100%" height={38} className="rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton width={140} height={20} />
            <Skeleton width={70} height={28} className="rounded-lg" />
          </div>
          <Skeleton width="100%" height={280} className="rounded-xl font-mono" />
        </div>
      </div>
    </div>
  );
}
