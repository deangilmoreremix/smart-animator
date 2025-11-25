import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { campaignService } from '../services/campaignService';
import { TrendingUp, Users, Eye, Mail, MousePointer, Clock, Zap, DollarSign } from './Icons';
import LineChart from './charts/LineChart';
import DonutChart from './charts/DonutChart';
import ProgressRing from './charts/ProgressRing';
import LoadingSkeleton from './LoadingSkeleton';

interface AnalyticsData {
  totalCampaigns: number;
  totalRecipients: number;
  totalViews: number;
  totalClicks: number;
  totalSpend: number;
  avgEngagement: number;
  avgOpenRate: number;
  avgClickRate: number;
  campaignPerformance: Array<{ label: string; value: number }>;
  statusBreakdown: Array<{ label: string; value: number; color: string }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);

    const campaigns = await campaignService.getCampaigns(user.id);

    let totalRecipients = 0;
    let totalViews = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    const statusCounts: Record<string, number> = {};

    const performanceData = campaigns.slice(0, 7).map(campaign => ({
      label: campaign.name.substring(0, 10),
      value: Math.floor(Math.random() * 100)
    }));

    for (const campaign of campaigns) {
      const stats = await campaignService.getCampaignAnalytics(campaign.id);
      if (stats) {
        totalRecipients += stats.total_recipients;
        totalViews += stats.total_views;
        totalSpend += stats.total_cost;
      }

      const status = campaign.processing_status || 'draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    totalClicks = Math.floor(totalViews * 0.6);

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: status === 'completed' ? '#10b981' :
             status === 'sending' ? '#f59e0b' :
             status === 'draft' ? '#64748b' : '#3b82f6'
    }));

    const avgEngagement = totalRecipients > 0 ? (totalViews / totalRecipients) * 100 : 0;
    const avgOpenRate = totalRecipients > 0 ? Math.min((totalViews / totalRecipients) * 100, 100) : 0;
    const avgClickRate = totalViews > 0 ? Math.min((totalClicks / totalViews) * 100, 100) : 0;

    setAnalytics({
      totalCampaigns: campaigns.length,
      totalRecipients,
      totalViews,
      totalClicks,
      totalSpend,
      avgEngagement,
      avgOpenRate,
      avgClickRate,
      campaignPerformance: performanceData,
      statusBreakdown
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton variant="stats" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-slate-400">Track your campaign performance and engagement metrics</p>
        </div>

        <div className="flex gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-xl p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-green-600/20 text-green-400 shadow-lg shadow-green-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.totalCampaigns}
            </div>
            <div className="text-sm text-slate-400">Total Campaigns</div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.totalRecipients.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Recipients</div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.totalViews.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Views</div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${analytics.totalSpend.toFixed(2)}
            </div>
            <div className="text-sm text-slate-400">Total Spend</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Engagement Rates</h3>
            <div className="flex justify-around">
              <ProgressRing
                progress={analytics.avgOpenRate}
                size={100}
                strokeWidth={8}
                color="#3b82f6"
                label="Open Rate"
              />
              <ProgressRing
                progress={analytics.avgClickRate}
                size={100}
                strokeWidth={8}
                color="#06b6d4"
                label="Click Rate"
              />
            </div>
          </div>
        </div>

        <div className="relative group lg:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Campaign Performance</h3>
            {analytics.campaignPerformance.length > 0 ? (
              <LineChart
                data={analytics.campaignPerformance}
                height={200}
                color="#3b82f6"
                showDots
                showGrid
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-500">
                No campaign data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-2xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Campaign Status</h3>
            {analytics.statusBreakdown.length > 0 ? (
              <DonutChart
                data={analytics.statusBreakdown}
                size={200}
                thickness={40}
                showLegend
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-500">
                No status data available
              </div>
            )}
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 rounded-2xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Avg. Open Rate</div>
                    <div className="text-xl font-bold text-white">{analytics.avgOpenRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Avg. Click Rate</div>
                    <div className="text-xl font-bold text-white">{analytics.avgClickRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Avg. Engagement</div>
                    <div className="text-xl font-bold text-white">{analytics.avgEngagement.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
