import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonFilterBar, SkeletonCardGrid, SkeletonForm, SkeletonTabs } from '../BaseSkeletons';

export function WorkflowsListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonCardGrid count={6} />
    </div>
  );
}

export function WorkflowBuilderSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950/40 p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200/70 dark:border-gray-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={90} height={14} />
            <span className="text-gray-300">/</span>
            <Skeleton width={130} height={14} />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width={220} height={28} />
            <Skeleton width={70} height={22} className="rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={90} height={40} className="rounded-xl" />
          <Skeleton width={120} height={40} className="rounded-xl" />
        </div>
      </div>

      {/* Visual Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 p-8 rounded-2xl border border-dashed border-gray-300/80 dark:border-gray-700/80 bg-white/40 dark:bg-gray-900/40 flex flex-col items-center justify-center space-y-8">
          {/* Start Node */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md flex items-center gap-3 w-64">
            <Skeleton variant="circular" width={28} height={28} />
            <div className="space-y-1 flex-1">
              <Skeleton width="60%" height={14} />
              <Skeleton width="40%" height={10} />
            </div>
          </div>

          {/* Connector Line */}
          <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-700" />

          {/* Middle Stage Node */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md flex items-center gap-3 w-64">
            <Skeleton variant="circular" width={28} height={28} />
            <div className="space-y-1 flex-1">
              <Skeleton width="75%" height={14} />
              <Skeleton width="50%" height={10} />
            </div>
          </div>

          {/* Connector Line */}
          <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-700" />

          {/* End Action Node */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md flex items-center gap-3 w-64">
            <Skeleton variant="circular" width={28} height={28} />
            <div className="space-y-1 flex-1">
              <Skeleton width="70%" height={14} />
              <Skeleton width="45%" height={10} />
            </div>
          </div>
        </div>

        {/* Sidebar Configuration Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-5">
          <Skeleton width={140} height={20} />
          <SkeletonTabs tabCount={2} />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Skeleton width={90} height={14} />
              <Skeleton width="100%" height={38} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton width={120} height={14} />
              <Skeleton width="100%" height={70} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton width={100} height={14} />
              <Skeleton width="100%" height={38} className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowSettingsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={240} actionsCount={1} />
      <SkeletonTabs tabCount={3} />
      <SkeletonForm fields={5} />
    </div>
  );
}
