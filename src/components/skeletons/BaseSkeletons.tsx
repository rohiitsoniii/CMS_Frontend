import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface SkeletonHeaderProps {
  titleWidth?: string | number;
  hasSubtitle?: boolean;
  actionsCount?: number;
  className?: string;
  hasBreadcrumbs?: boolean;
}

export function SkeletonHeader({
  titleWidth = '220px',
  hasSubtitle = true,
  actionsCount = 2,
  className,
  hasBreadcrumbs = false,
}: SkeletonHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/60 dark:border-gray-800/60', className)}>
      <div className="space-y-2">
        {hasBreadcrumbs && (
          <div className="flex items-center gap-2 mb-2">
            <Skeleton width={60} height={14} />
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <Skeleton width={90} height={14} />
          </div>
        )}
        <Skeleton width={titleWidth} height={32} className="rounded-lg" />
        {hasSubtitle && <Skeleton width="340px" height={16} className="max-w-full" />}
      </div>
      {actionsCount > 0 && (
        <div className="flex items-center gap-3">
          {Array.from({ length: actionsCount }).map((_, i) => (
            <Skeleton key={i} width={i === 0 && actionsCount > 1 ? 90 : 120} height={38} className="rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}

export interface SkeletonStatsGridProps {
  count?: number;
  cols?: number;
  className?: string;
}

export function SkeletonStatsGrid({ count = 4, cols = 4, className }: SkeletonStatsGridProps) {
  const gridColsClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : cols === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={cn('grid gap-4', gridColsClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={16} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <Skeleton width={80} height={28} />
            <Skeleton width={48} height={18} className="rounded-full" />
          </div>
          <Skeleton width="70%" height={12} />
        </div>
      ))}
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full border border-gray-200/70 dark:border-gray-800/80 rounded-xl overflow-hidden bg-white/50 dark:bg-gray-900/50 shadow-sm', className)}>
      {showHeader && (
        <div className="flex items-center gap-4 px-6 py-4 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-200/70 dark:border-gray-800/80">
          <Skeleton width={20} height={20} className="rounded" />
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              width={i === 0 ? '25%' : i === columns - 1 ? '15%' : `${70 / (columns - 1)}%`}
              height={18}
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 px-6 py-4">
            <Skeleton width={20} height={20} className="rounded" />
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                style={{
                  width: cIdx === 0 ? '25%' : cIdx === columns - 1 ? '15%' : `${70 / (columns - 1)}%`,
                }}
              >
                {cIdx === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={28} height={28} />
                    <div className="space-y-1">
                      <Skeleton width={110} height={16} />
                      <Skeleton width={70} height={12} />
                    </div>
                  </div>
                ) : cIdx === columns - 1 ? (
                  <div className="flex justify-end gap-2">
                    <Skeleton width={32} height={32} className="rounded-lg" />
                    <Skeleton width={32} height={32} className="rounded-lg" />
                  </div>
                ) : (
                  <Skeleton width={cIdx % 2 === 0 ? '80%' : '55%'} height={16} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50/40 dark:bg-gray-800/20 border-t border-gray-200/70 dark:border-gray-800/80">
        <Skeleton width={140} height={16} />
        <div className="flex gap-2">
          <Skeleton width={70} height={32} className="rounded-lg" />
          <Skeleton width={70} height={32} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export interface SkeletonCardGridProps {
  count?: number;
  cols?: string;
  className?: string;
}

export function SkeletonCardGrid({
  count = 6,
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  className,
}: SkeletonCardGridProps) {
  return (
    <div className={cn('grid gap-5', cols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm space-y-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton width={44} height={44} className="rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton width={130} height={18} />
                <Skeleton width={80} height={12} />
              </div>
            </div>
            <Skeleton width={60} height={22} className="rounded-full" />
          </div>
          <div className="space-y-2 pt-1">
            <Skeleton width="100%" height={14} />
            <Skeleton width="75%" height={14} />
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <Skeleton width={90} height={14} />
            <Skeleton width={60} height={28} className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface SkeletonFilterBarProps {
  hasSearch?: boolean;
  filterCount?: number;
  hasActionButton?: boolean;
  className?: string;
}

export function SkeletonFilterBar({
  hasSearch = true,
  filterCount = 2,
  hasActionButton = true,
  className,
}: SkeletonFilterBarProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/40 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 rounded-xl', className)}>
      <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
        {hasSearch && <Skeleton width="100%" height={38} className="max-w-md rounded-lg" />}
        {Array.from({ length: filterCount }).map((_, i) => (
          <Skeleton key={i} width={110} height={38} className="rounded-lg hidden md:block" />
        ))}
      </div>
      {hasActionButton && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Skeleton width={80} height={38} className="rounded-lg" />
          <Skeleton width={40} height={38} className="rounded-lg" />
        </div>
      )}
    </div>
  );
}

export interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
}

export function SkeletonForm({ fields = 4, hasSubmit = true, className }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-5 p-6 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 shadow-sm', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width={i % 2 === 0 ? 110 : 150} height={16} />
          {i === 2 && fields > 3 ? (
            <Skeleton width="100%" height={90} className="rounded-lg" />
          ) : (
            <Skeleton width="100%" height={40} className="rounded-lg" />
          )}
        </div>
      ))}
      {hasSubmit && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-800/60">
          <Skeleton width={80} height={40} className="rounded-lg" />
          <Skeleton width={120} height={40} className="rounded-lg" />
        </div>
      )}
    </div>
  );
}

export interface SkeletonTreeNavProps {
  items?: number;
  className?: string;
}

export function SkeletonTreeNav({ items = 6, className }: SkeletonTreeNavProps) {
  return (
    <div className={cn('space-y-2 p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50', className)}>
      <Skeleton width={90} height={16} className="mb-3" />
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 py-1.5"
          style={{ paddingLeft: `${(i % 3) * 16}px` }}
        >
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width={i % 2 === 0 ? '70%' : '50%'} height={16} />
        </div>
      ))}
    </div>
  );
}

export interface SkeletonTabsProps {
  tabCount?: number;
  className?: string;
}

export function SkeletonTabs({ tabCount = 4, className }: SkeletonTabsProps) {
  return (
    <div className={cn('flex items-center gap-2 border-b border-gray-200/70 dark:border-gray-800/80 pb-2', className)}>
      {Array.from({ length: tabCount }).map((_, i) => (
        <Skeleton key={i} width={80 + (i % 3) * 20} height={34} className="rounded-lg" />
      ))}
    </div>
  );
}
