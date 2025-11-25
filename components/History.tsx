import React, { useEffect, useState } from 'react';
import { databaseService, VideoGeneration } from '../services/supabase';
import { campaignService } from '../services/campaignService';
import { useAuth } from '../contexts/AuthContext';
import { Video, Clock, Trash2, Download, Film, Zap, TrendingUp, Users, Sparkles } from './Icons';
import CampaignDashboard from './CampaignDashboard';
import RecipientManager from './RecipientManager';
import LoadingSkeleton from './LoadingSkeleton';
import AnalyticsDashboard from './AnalyticsDashboard';

const History: React.FC = () => {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'campaigns' | 'stats'>('videos');
  const [showCampaignView, setShowCampaignView] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadGenerations();
    }
  }, [user?.id]);

  const loadGenerations = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await databaseService.getVideoGenerations(user.id);
    setGenerations(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this generation?')) {
      const success = await databaseService.deleteVideoGeneration(id);
      if (success) {
        setGenerations(generations.filter(g => g.id !== id));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (showCampaignView && selectedCampaignId) {
    return (
      <RecipientManager
        campaignId={selectedCampaignId}
        onBack={() => {
          setShowCampaignView(false);
          setSelectedCampaignId(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="border-b border-slate-800 pb-3">
          <div className="h-10 w-full bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="video" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">History & Campaigns</h2>
          <p className="text-slate-400">View your generated videos and campaign history</p>
        </div>
        {activeTab === 'videos' && generations.length > 0 && (
          <div className="text-sm text-slate-500 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
            {generations.length} videos
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-2">
        <nav className="flex gap-2">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 px-6 py-3 font-medium text-sm rounded-lg transition-all ${
              activeTab === 'videos'
                ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4 inline mr-2" />
            My Videos
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 px-6 py-3 font-medium text-sm rounded-lg transition-all ${
              activeTab === 'campaigns'
                ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-6 py-3 font-medium text-sm rounded-lg transition-all ${
              activeTab === 'stats'
                ? 'bg-green-600/20 text-green-400 shadow-lg shadow-green-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Stats
          </button>
        </nav>
      </div>

      {activeTab === 'videos' && (
        <>
          {generations.length === 0 ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl blur-2xl" />
              <div className="relative flex flex-col items-center justify-center min-h-[400px] text-center bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No videos yet</h3>
                <p className="text-slate-400 max-w-md">Your video generation history will appear here. Start creating amazing videos with AI!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((gen) => (
          <div key={gen.id} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
              {gen.video_url ? (
                <div className="aspect-video bg-slate-950 relative overflow-hidden group">
                  <video
                    src={gen.video_url}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-slate-600" />
                  </div>
                </div>
              )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate mb-1">{gen.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{gen.prompt}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ml-2 whitespace-nowrap backdrop-blur-sm border shadow-lg ${
                  gen.status === 'completed' ? 'bg-green-600/20 text-green-400 border-green-500/20 shadow-green-500/30' :
                  gen.status === 'failed' ? 'bg-red-600/20 text-red-400 border-red-500/20 shadow-red-500/30' :
                  'bg-yellow-600/20 text-yellow-400 border-yellow-500/20 shadow-yellow-500/30'
                }`}>
                  {gen.status}
                </span>
              </div>

              <div className="flex items-center text-xs text-slate-500 mb-3 space-x-3">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(gen.created_at!)}
                </span>
                <span>{gen.duration}s</span>
                <span>{gen.resolution}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-600/10 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20">{gen.model.split('-')[0]}</span>
                <span className="text-xs bg-cyan-600/10 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-500/20">{gen.aspect_ratio}</span>
                <span className="text-xs bg-purple-600/10 text-purple-400 px-2 py-1 rounded-lg border border-purple-500/20">{gen.mode}</span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {gen.video_url && (
                  <a
                    href={gen.video_url}
                    download={`${gen.title}.mp4`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => handleDelete(gen.id!)}
                  className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          </div>
        ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'campaigns' && (
        <CampaignDashboard
          onCreateNew={() => {}}
          onViewCampaign={(id) => {
            setSelectedCampaignId(id);
            setShowCampaignView(true);
          }}
        />
      )}

      {activeTab === 'stats' && (
        <AnalyticsDashboard />
      )}
    </div>
  );
};

export default History;
