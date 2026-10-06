import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonHeader, SkeletonFilterBar, SkeletonCardGrid, SkeletonTabs, SkeletonForm } from '../BaseSkeletons';

export function LocalesSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={1} hasActionButton />
      <SkeletonCardGrid count={6} />
    </div>
  );
}

export function TranslationSettingsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <SkeletonHeader titleWidth={240} actionsCount={1} />
      <SkeletonTabs tabCount={3} />
      <SkeletonForm fields={5} />
    </div>
  );
}

export function EmailTemplatesSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SkeletonHeader titleWidth={220} actionsCount={2} />
      <SkeletonFilterBar hasSearch filterCount={2} hasActionButton />
      <SkeletonCardGrid count={6} />
    </div>
  );
}
