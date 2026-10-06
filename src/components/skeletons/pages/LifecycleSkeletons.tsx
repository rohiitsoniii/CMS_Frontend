import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonFilterBar, SkeletonTable, SkeletonTabs } from '../BaseSkeletons';

export function TrashSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={180} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function ArchiveSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={180} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function BackupSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />

      {/* Backup Schedule / Auto-backup card */}
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton width={180} height={20} />
            <Skeleton width={280} height={14} />
          </div>
          <Skeleton width={44} height={24} className="rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
            <Skeleton width={80} height={12} />
            <Skeleton width={120} height={16} />
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
            <Skeleton width={80} height={12} />
            <Skeleton width={120} height={16} />
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
            <Skeleton width={80} height={12} />
            <Skeleton width={120} height={16} />
          </div>
        </div>
      </div>

      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

export function ImportExportSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={1} />
      <SkeletonTabs tabCount={2} />

      <div className="p-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 flex flex-col items-center justify-center space-y-4">
        <Skeleton variant="circular" width={56} height={56} />
        <div className="text-center space-y-2">
          <Skeleton width={180} height={20} className="mx-auto" />
          <Skeleton width={260} height={14} className="mx-auto" />
        </div>
        <Skeleton width={120} height={40} className="rounded-xl mt-2" />
      </div>

      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <Skeleton width={160} height={18} />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <Skeleton width="40%" height={16} />
              <Skeleton width={80} height={28} className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
