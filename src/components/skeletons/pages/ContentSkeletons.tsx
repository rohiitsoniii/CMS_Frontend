import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SkeletonHeader,
  SkeletonFilterBar,
  SkeletonCardGrid,
  SkeletonTable,
  SkeletonStatsGrid,
} from '../BaseSkeletons';

export function ContentTypesListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={240} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonCardGrid count={6} />
    </div>
  );
}

export function ContentTypeBuilderSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950/40 p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200/70 dark:border-gray-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={100} height={14} />
            <span className="text-gray-300">/</span>
            <Skeleton width={140} height={14} />
          </div>
          <Skeleton width={260} height={28} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={90} height={40} className="rounded-xl" />
          <Skeleton width={130} height={40} className="rounded-xl" />
        </div>
      </div>

      {/* 2-Column builder canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Available Field Palette & Field List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Schema Metadata Card */}
          <div className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={140} height={18} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton width="100%" height={38} className="rounded-lg" />
              <Skeleton width="100%" height={38} className="rounded-lg" />
            </div>
          </div>

          {/* Drag & Drop Field Stack */}
          <div className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/60">
              <Skeleton width={160} height={20} />
              <Skeleton width={110} height={32} className="rounded-lg" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
              >
                <div className="flex items-center gap-3">
                  <Skeleton width={16} height={16} />
                  <Skeleton variant="rounded" width={32} height={32} />
                  <div className="space-y-1">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={70} height={12} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton width={50} height={22} className="rounded-full" />
                  <Skeleton width={28} height={28} className="rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Field Palette / Inspector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
            <Skeleton width={120} height={20} />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200/60 dark:border-gray-800/60"
                >
                  <Skeleton variant="rounded" width={24} height={24} />
                  <Skeleton width="60%" height={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DynamicContentListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={3} hasActionButton />
      <SkeletonTable rows={7} columns={5} />
    </div>
  );
}

export function DynamicContentEditorSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950/30 p-6 space-y-6 max-w-7xl mx-auto">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200/70 dark:border-gray-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={80} height={14} />
            <span className="text-gray-300">/</span>
            <Skeleton width={140} height={14} />
          </div>
          <Skeleton width={300} height={28} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={80} height={40} className="rounded-xl" />
          <Skeleton width={100} height={40} className="rounded-xl" />
          <Skeleton width={110} height={40} className="rounded-xl" />
        </div>
      </div>

      {/* Editor Grid: 8 Cols Main Form, 4 Cols Meta Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          {/* Main Title Input */}
          <div className="p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-2">
            <Skeleton width={60} height={16} />
            <Skeleton width="100%" height={44} className="rounded-lg" />
          </div>

          {/* Rich Content Editor */}
          <div className="p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} width={28} height={28} className="rounded" />
              ))}
            </div>
            <Skeleton width="100%" height={260} className="rounded-lg" />
          </div>

          {/* Media / Extra Fields Accordion */}
          <div className="p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={120} height={20} />
            <Skeleton width="100%" height={120} className="rounded-xl" />
          </div>
        </div>

        {/* Sidebar: Publishing State, Workflow, SEO */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={110} height={18} />
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <Skeleton width={80} height={14} />
                <Skeleton width={60} height={20} className="rounded-full" />
              </div>
              <div className="flex justify-between items-center py-1">
                <Skeleton width={90} height={14} />
                <Skeleton width={100} height={14} />
              </div>
              <div className="flex justify-between items-center py-1">
                <Skeleton width={70} height={14} />
                <Skeleton width={80} height={14} />
              </div>
            </div>
            <Skeleton width="100%" height={38} className="rounded-lg mt-2" />
          </div>

          <div className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-3">
            <Skeleton width={100} height={18} />
            <Skeleton width="100%" height={80} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentAnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonStatsGrid count={4} cols={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <Skeleton width={160} height={22} />
          <Skeleton width="100%" height={260} className="rounded-xl" />
        </div>
        <div className="p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 shadow-sm space-y-4">
          <Skeleton width={160} height={22} />
          <Skeleton width="100%" height={260} className="rounded-xl" />
        </div>
      </div>
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}
