import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { campaignService } from '../services/campaignService';
import { Campaign, CampaignAnalytics } from '../types';
import Button from './Button';
import { Plus, Eye, Users, TrendingUp, DollarSign, Mail, MousePointer, Clock, Sparkles } from './Icons';
import LoadingSkeleton from './LoadingSkeleton';
import ProgressRing from './charts/ProgressRing';

interface CampaignDashboardProps {
  onCreateNew?: () => void;
  onViewCampaign?: (campaignId: string) => void;
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ onCreateNew, onViewCampaign }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, CampaignAnalytics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;

    setLoading(true);
    const data = await campaignService.getCampaigns(user.id);
    setCampaigns(data);

    const analyticsData: Record<string, CampaignAnalytics> = {};
    for (const campaign of data) {
      const analytics = await campaignService.getCampaignAnalytics(campaign.id);
      if (analytics) {
        analyticsData[campaign.id] = analytics;
      }
    }
    setAnalytics(analyticsData);
    setLoading(false);
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig = {
      draft: { bg: 'bg-slate-700/50', text: 'text-slate-300', glow: 'shadow-slate-500/20' },
      processing: { bg: 'bg-blue-600/20', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
      ready: { bg: 'bg-green-600/20', text: 'text-green-400', glow: 'shadow-green-500/30' },
      sending: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
      completed: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
      cancelled: { bg: 'bg-red-600/20', text: 'text-red-400', glow: 'shadow-red-500/30' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${config.bg} ${config.text} border border-current/20 shadow-lg ${config.glow} backdrop-blur-sm`}
      >
        {status || 'draft'}
      </span>
    );
  };

  const calculateTotalStats = () => {
    const totals = campaigns.reduce((acc, campaign) => {
      const stats = analytics[campaign.id];
      if (stats) {
        acc.recipients += stats.total_recipients;
        acc.generated += stats.videos_generated;
        acc.views += stats.total_views;
        acc.cost += stats.total_cost;
      }
      return acc;
    }, { recipients: 0, generated: 0, views: 0, cost: 0 });

    return totals;
  };

  const totals = calculateTotalStats();
  const avgEngagement = totals.recipients > 0 ? (totals.views / totals.recipients) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-40 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton variant="stats" count={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Campaigns
          </h2>
          <p className="text-slate-400">Monitor and manage your video campaigns</p>
        </div>
        <Button onClick={onCreateNew} icon={<Plus className="w-5 h-5" />}>
          <Sparkles className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totals.recipients.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Total Recipients</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totals.generated.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Videos Generated</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <MousePointer className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totals.views.toLocaleString()}
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
                ${totals.cost.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Total Spend</div>
            </div>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl blur-2xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No campaigns yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start creating personalized video campaigns to engage your audience at scale
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const stats = analytics[campaign.id];
            const engagement = stats && stats.total_recipients > 0
              ? (stats.total_views / stats.total_recipients) * 100
              : 0;

            return (
              <div
                key={campaign.id}
                className="relative group cursor-pointer"
                onClick={() => onViewCampaign?.(campaign.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(campaign.processing_status)}
                  </div>

                  {stats && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <ProgressRing
                          progress={engagement}
                          size={100}
                          strokeWidth={6}
                          color="#3b82f6"
                          label="Engagement"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center text-slate-400">
                            <Users className="w-4 h-4 mr-2" />
                            Recipients
                          </div>
                          <div className="text-white font-semibold">{stats.total_recipients}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center text-slate-400">
                            <Mail className="w-4 h-4 mr-2" />
                            Generated
                          </div>
                          <div className="text-white font-semibold">{stats.videos_generated}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center text-slate-400">
                            <Eye className="w-4 h-4 mr-2" />
                            Views
                          </div>
                          <div className="text-white font-semibold">{stats.total_views}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center text-slate-400">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Cost
                          </div>
                          <div className="text-white font-semibold">${stats.total_cost.toFixed(2)}</div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                      View Details
                      <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;
