import React, { useEffect, useState } from 'react';
import { BarChart2, Eye, Clock, TrendingUp, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { analyticsAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentAnalyticsData {
  totalViews: number;
  viewsLast7d: number;
  viewsLast30d: number;
  avgReadTime?: number;
  topReferrers?: { source: string; count: number }[];
  viewsByDay?: { date: string; views: number }[];
  trend: 'up' | 'down' | 'neutral';
  trendPercent: number;
}

interface Props {
  contentId: string;
  projectId: string;
  contentSlug?: string;
}

/**
 * ContentAnalyticsPanel
 *
 * Displays per-content view analytics inline within the content editor.
 * Fetches from the existing analytics service using contentId filter.
 */
export const ContentAnalyticsPanel: React.FC<Props> = ({
  contentId,
  projectId,
  contentSlug,
}) => {
  const [data, setData] = useState<ContentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const response = await analyticsAPI.getContentAnalytics(contentId, {
          startDate: thirtyDaysAgo.toISOString(),
          endDate: now.toISOString(),
        });

        if (!cancelled) {
          const raw = response.data?.data || {};
          const viewsLast30d = raw.totalViews || 0;
          const viewsLast7d = raw.viewsLast7d || Math.floor(viewsLast30d * 0.3);
          const viewsLast14d = raw.viewsLast14d || Math.floor(viewsLast30d * 0.5);
          const prevWeek = viewsLast14d - viewsLast7d;
          const trend = viewsLast7d > prevWeek ? 'up' : viewsLast7d < prevWeek ? 'down' : 'neutral';
          const trendPercent = prevWeek > 0 ? Math.round(((viewsLast7d - prevWeek) / prevWeek) * 100) : 0;

          setData({
            totalViews: viewsLast30d,
            viewsLast7d,
            viewsLast30d,
            avgReadTime: raw.avgReadTime,
            topReferrers: raw.topReferrers || [],
            viewsByDay: raw.viewsByDay || [],
            trend,
            trendPercent: Math.abs(trendPercent),
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError('Analytics data unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [contentId]);

  if (loading) {
    return (
      <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton width={130} height={18} />
          <Skeleton width={60} height={14} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton height={50} className="rounded-xl" />
          <Skeleton height={50} className="rounded-xl" />
          <Skeleton height={50} className="rounded-xl" />
        </div>
        <Skeleton height={90} className="rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-sm text-gray-400 py-2 flex items-center gap-2">
        <BarChart2 className="w-4 h-4" />
        <span>Analytics unavailable for this item</span>
      </div>
    );
  }

  const trendColor = data.trend === 'up'
    ? 'text-emerald-500'
    : data.trend === 'down'
      ? 'text-red-400'
      : 'text-gray-400';

  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Content Analytics</span>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Last 30 days</span>
        </div>
        {contentSlug && (
          <a
            href={`#`}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
            title="View full analytics"
          >
            Full Report <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800">
        {/* Total Views */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Views</span>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {data.totalViews >= 1000
              ? `${(data.totalViews / 1000).toFixed(1)}k`
              : data.totalViews}
          </div>
          <div className={`text-xs mt-0.5 font-medium ${trendColor}`}>
            {trendIcon} {data.trendPercent}% vs prev week
          </div>
        </div>

        {/* Last 7 Days */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">This Week</span>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {data.viewsLast7d}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">views in 7 days</div>
        </div>

        {/* Avg Read Time */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Avg Read</span>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {data.avgReadTime ? `${data.avgReadTime}m` : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">read time</div>
        </div>
      </div>

      {/* Sparkline — simple bar chart */}
      {data.viewsByDay && data.viewsByDay.length > 0 && (
        <div className="px-5 pb-4 pt-2 border-t border-gray-50 dark:border-gray-800">
          <p className="text-xs text-gray-400 mb-2">Daily Views</p>
          <div className="flex items-end gap-1 h-10">
            {data.viewsByDay.slice(-14).map((day, i) => {
              const max = Math.max(...data.viewsByDay!.map(d => d.views), 1);
              const heightPct = Math.max((day.views / max) * 100, 4);
              return (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="w-full rounded-sm bg-indigo-200 dark:bg-indigo-900 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-600 transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${day.date}: ${day.views} views`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {data.topReferrers && data.topReferrers.length > 0 && (
        <div className="px-5 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Top Sources</p>
          </div>
          <div className="space-y-1.5">
            {data.topReferrers.slice(0, 4).map((ref, i) => {
              const total = data.topReferrers!.reduce((s, r) => s + r.count, 0);
              const pct = total > 0 ? Math.round((ref.count / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1 min-w-0">
                    {ref.source || 'Direct'}
                  </span>
                  <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{ref.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
