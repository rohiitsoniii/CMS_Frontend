import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonFilterBar, SkeletonTreeNav } from '../BaseSkeletons';

export function MediaLibrarySkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={200} actionsCount={3} />
      <SkeletonFilterBar hasSearch filterCount={3} hasActionButton />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Folders / Tags Tree */}
        <div className="lg:col-span-3 space-y-4">
          <SkeletonTreeNav items={6} />
          <div className="p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50 space-y-2">
            <Skeleton width={110} height={16} />
            <Skeleton width="100%" height={8} className="rounded-full mt-2" />
            <div className="flex justify-between text-xs pt-1">
              <Skeleton width={60} height={12} />
              <Skeleton width={60} height={12} />
            </div>
          </div>
        </div>

        {/* Right: Media Assets Grid */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="group relative rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 overflow-hidden shadow-sm"
              >
                {/* Thumbnail placeholder */}
                <Skeleton width="100%" height={140} className="rounded-none" />
                <div className="p-3 space-y-1.5">
                  <Skeleton width="85%" height={14} />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton width={50} height={12} />
                    <Skeleton width={40} height={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
