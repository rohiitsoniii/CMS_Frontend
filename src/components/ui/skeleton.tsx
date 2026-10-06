import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rounded',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    text: 'rounded-md h-4 my-1',
  };

  const inlineStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : style?.width,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : style?.height,
  };

  return (
    <div
      className={cn(
        'bg-gray-200/80 dark:bg-gray-800/80 skeleton-shimmer animate-pulse',
        variantStyles[variant],
        className
      )}
      style={inlineStyle}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Skeleton;
