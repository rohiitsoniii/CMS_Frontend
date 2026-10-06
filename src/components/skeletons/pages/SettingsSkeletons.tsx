import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonTabs, SkeletonForm, SkeletonTable, SkeletonCardGrid, SkeletonFilterBar } from '../BaseSkeletons';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={1} />
      <SkeletonTabs tabCount={4} />
      <SkeletonForm fields={6} />
    </div>
  );
}

export function SecuritySkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={1} />
      <SkeletonTabs tabCount={3} />

      {/* 2FA Card */}
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Skeleton width={180} height={20} />
            <Skeleton width={320} height={14} />
          </div>
          <Skeleton width={44} height={24} className="rounded-full" />
        </div>
      </div>

      {/* Password Reset Card */}
      <SkeletonForm fields={3} />

      {/* Active Sessions */}
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <Skeleton width={160} height={20} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={28} height={28} />
              <div className="space-y-1">
                <Skeleton width={140} height={16} />
                <Skeleton width={100} height={12} />
              </div>
            </div>
            <Skeleton width={80} height={32} className="rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={240} actionsCount={2} />
      <SkeletonTabs tabCount={3} />
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800/60">
          <Skeleton width={160} height={20} />
          <Skeleton width={100} height={36} className="rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton width="40%" height={38} className="rounded-lg" />
              <Skeleton width="50%" height={38} className="rounded-lg" />
              <Skeleton width={36} height={36} className="rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-3">
          <Skeleton width={110} height={40} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function GitSyncSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="space-y-1.5 flex-1">
            <Skeleton width={200} height={20} />
            <Skeleton width={300} height={14} />
          </div>
          <Skeleton width={90} height={36} className="rounded-lg" />
        </div>
      </div>
      <SkeletonTable rows={4} columns={4} />
    </div>
  );
}

export function APIKeysSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={1} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function WebhooksSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={1} hasActionButton />
      <SkeletonCardGrid count={4} cols="grid-cols-1 md:grid-cols-2" />
    </div>
  );
}

export function WebhookLogsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonTable rows={8} columns={5} />
    </div>
  );
}
