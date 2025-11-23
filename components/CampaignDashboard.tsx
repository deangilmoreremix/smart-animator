import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { campaignService } from '../services/campaignService';
import { Campaign, CampaignAnalytics } from '../types';
import Button from './Button';
import { Plus, Eye, Users, TrendingUp, DollarSign } from './Icons';

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
    const colors = {
      draft: 'bg-slate-700 text-slate-300',
      processing: 'bg-blue-700 text-blue-300',
      ready: 'bg-green-700 text-green-300',
      sending: 'bg-yellow-700 text-yellow-300',
      completed: 'bg-emerald-700 text-emerald-300',
      cancelled: 'bg-red-700 text-red-300'
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          colors[status as keyof typeof colors] || colors.draft
        }`}
      >
        {status || 'draft'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Campaigns</h2>
        <Button onClick={onCreateNew} icon={<Plus className="w-5 h-5" />}>
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-slate-400 mb-4">No campaigns yet</div>
          <Button onClick={onCreateNew}>Create Your First Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const stats = analytics[campaign.id];

            return (
              <div
                key={campaign.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
                    <div className="text-sm text-slate-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {getStatusBadge(campaign.processing_status)}
                </div>

                {stats && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-400">
                        <Users className="w-4 h-4 mr-2" />
                        Recipients
                      </div>
                      <div className="text-white font-medium">{stats.total_recipients}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-400">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Generated
                      </div>
                      <div className="text-white font-medium">{stats.videos_generated}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-400">
                        <Eye className="w-4 h-4 mr-2" />
                        Views
                      </div>
                      <div className="text-white font-medium">{stats.total_views}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cost
                      </div>
                      <div className="text-white font-medium">${stats.total_cost.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => onViewCampaign?.(campaign.id)}
                  variant="secondary"
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;
