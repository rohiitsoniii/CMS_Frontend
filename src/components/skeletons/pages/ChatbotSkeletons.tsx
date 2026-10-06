import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SkeletonHeader,
  SkeletonFilterBar,
  SkeletonCardGrid,
  SkeletonStatsGrid,
  SkeletonTabs,
  SkeletonForm,
  SkeletonTable,
} from '../BaseSkeletons';

export function RagBotListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonCardGrid count={6} />
    </div>
  );
}

export function RagBotBuilderSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950/40 p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200/70 dark:border-gray-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={90} height={14} />
            <span className="text-gray-300">/</span>
            <Skeleton width={130} height={14} />
          </div>
          <Skeleton width={240} height={28} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={90} height={40} className="rounded-xl" />
          <Skeleton width={120} height={40} className="rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Model, System Instructions, Knowledge Connections */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
            <Skeleton width={140} height={20} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton width={80} height={14} />
                <Skeleton width="100%" height={38} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton width={80} height={14} />
                <Skeleton width="100%" height={38} className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton width={110} height={14} />
              <Skeleton width="100%" height={120} className="rounded-lg" />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={160} height={18} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <Skeleton width={140} height={16} />
                  <Skeleton width={90} height={12} />
                </div>
                <Skeleton width={38} height={22} className="rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Simulator / Playground Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60 dark:border-gray-800/60 mb-4">
              <Skeleton width={120} height={18} />
              <Skeleton width={60} height={24} className="rounded-full" />
            </div>
            <div className="space-y-4">
              {/* Bot greeting */}
              <div className="flex gap-2">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton width={200} height={40} className="rounded-2xl rounded-tl-sm" />
              </div>
              {/* User message */}
              <div className="flex justify-end gap-2">
                <Skeleton width={180} height={36} className="rounded-2xl rounded-tr-sm" />
                <Skeleton variant="circular" width={28} height={28} />
              </div>
              {/* Bot response */}
              <div className="flex gap-2">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton width={240} height={60} className="rounded-2xl rounded-tl-sm" />
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Skeleton width="100%" height={44} className="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RagBotAnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonStatsGrid count={4} cols={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <Skeleton width={160} height={20} />
          <Skeleton width="100%" height={260} className="rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <Skeleton width={160} height={20} />
          <Skeleton width="100%" height={260} className="rounded-xl" />
        </div>
      </div>
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}

export function KnowledgeBaseSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonStatsGrid count={3} cols={3} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export function ChatbotConversationsSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SkeletonHeader titleWidth={240} actionsCount={1} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Conversation Thread List */}
        <div className="lg:col-span-4 p-4 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
          <Skeleton width="100%" height={38} className="rounded-lg mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <Skeleton width={110} height={16} />
                <Skeleton width={45} height={12} />
              </div>
              <Skeleton width="85%" height={12} />
            </div>
          ))}
        </div>

        {/* Right: Active Chat Session Stream */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="space-y-1">
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={12} />
              </div>
            </div>
            <Skeleton width={60} height={24} className="rounded-full" />
          </div>

          <div className="space-y-4 my-6">
            <div className="flex gap-2">
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton width={260} height={50} className="rounded-2xl rounded-tl-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <Skeleton width={200} height={40} className="rounded-2xl rounded-tr-sm" />
              <Skeleton variant="circular" width={28} height={28} />
            </div>
            <div className="flex gap-2">
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton width={320} height={70} className="rounded-2xl rounded-tl-sm" />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/60">
            <Skeleton width="100%" height={44} className="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatbotSettingsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={1} />
      <SkeletonTabs tabCount={3} />
      <SkeletonForm fields={5} />
    </div>
  );
}
