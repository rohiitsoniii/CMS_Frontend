import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonStatsGrid, SkeletonTable, SkeletonFilterBar } from '../BaseSkeletons';

export function BillingSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />

      {/* Current Plan Overview Card */}
      <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton width={140} height={24} />
              <Skeleton width={60} height={20} className="rounded-full" />
            </div>
            <Skeleton width={260} height={14} />
          </div>
          <Skeleton width={110} height={40} className="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
          <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
            <Skeleton width={80} height={12} />
            <Skeleton width={100} height={18} />
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
            <Skeleton width={80} height={12} />
            <Skeleton width={100} height={18} />
          </div>
          <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1">
            <Skeleton width={80} height={12} />
            <Skeleton width={100} height={18} />
          </div>
        </div>
      </div>

      <SkeletonTable rows={4} columns={5} />
    </div>
  );
}

export function PricingSkeleton() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Skeleton width={240} height={36} className="mx-auto rounded-lg" />
        <Skeleton width={380} height={18} className="mx-auto" />
        <div className="pt-2 flex justify-center">
          <Skeleton width={180} height={40} className="rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-6"
          >
            <div className="space-y-2">
              <Skeleton width={100} height={20} />
              <Skeleton width={180} height={14} />
            </div>
            <Skeleton width={120} height={36} />
            <Skeleton width="100%" height={44} className="rounded-xl" />
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton width={j % 2 === 0 ? '80%' : '60%'} height={14} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdvancedSearchSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={1} />
      <div className="p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <Skeleton width="100%" height={48} className="rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={100} height={18} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton width={16} height={16} className="rounded" />
                <Skeleton width="70%" height={14} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-2"
            >
              <div className="flex justify-between items-center">
                <Skeleton width={180} height={20} />
                <Skeleton width={60} height={20} className="rounded-full" />
              </div>
              <Skeleton width="90%" height={14} />
              <Skeleton width="75%" height={14} />
              <div className="flex gap-4 pt-2">
                <Skeleton width={70} height={12} />
                <Skeleton width={90} height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BotWidgetSkeleton() {
  return (
    <div className="w-full h-full min-h-[450px] p-4 flex flex-col justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="space-y-1">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={12} />
          </div>
        </div>
        <Skeleton width={24} height={24} className="rounded-full" />
      </div>
      <div className="space-y-3 my-4">
        <div className="flex gap-2">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton width={180} height={40} className="rounded-2xl rounded-tl-sm" />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton width={140} height={32} className="rounded-2xl rounded-tr-sm" />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      </div>
      <div className="pt-2">
        <Skeleton width="100%" height={40} className="rounded-xl" />
      </div>
    </div>
  );
}

export function AuditLogsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <SkeletonStatsGrid count={3} cols={3} />
      <SkeletonFilterBar hasSearch filterCount={3} hasActionButton />
      <SkeletonTable rows={8} columns={5} />
    </div>
  );
}

export function AuthCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <Skeleton variant="circular" width={48} height={48} className="mx-auto" />
        <Skeleton width={160} height={24} className="mx-auto" />
        <Skeleton width={220} height={14} className="mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton width={60} height={14} />
          <Skeleton width="100%" height={40} className="rounded-lg" />
        </div>
        <div className="space-y-1">
          <Skeleton width={70} height={14} />
          <Skeleton width="100%" height={40} className="rounded-lg" />
        </div>
        <Skeleton width="100%" height={42} className="rounded-lg mt-2" />
      </div>
    </div>
  );
}
