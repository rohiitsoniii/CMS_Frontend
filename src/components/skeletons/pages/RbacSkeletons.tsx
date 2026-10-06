import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonFilterBar, SkeletonTable } from '../BaseSkeletons';

export function RoleManagementSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Defined Roles List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={110} height={18} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <Skeleton width={110} height={16} />
                  <Skeleton width={70} height={12} />
                </div>
                <Skeleton width={50} height={20} className="rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Permission Matrix Grid */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="space-y-1">
              <Skeleton width={160} height={20} />
              <Skeleton width={240} height={14} />
            </div>
            <Skeleton width={100} height={36} className="rounded-lg" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, secIdx) => (
              <div key={secIdx} className="space-y-2">
                <Skeleton width={130} height={16} className="font-semibold" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, permIdx) => (
                    <div
                      key={permIdx}
                      className="p-3 rounded-lg border border-gray-100 dark:border-gray-800/80 flex items-center justify-between"
                    >
                      <Skeleton width={70} height={14} />
                      <Skeleton width={20} height={20} className="rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={180} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function UsersListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={3} hasActionButton />
      <SkeletonTable rows={7} columns={5} />
    </div>
  );
}
