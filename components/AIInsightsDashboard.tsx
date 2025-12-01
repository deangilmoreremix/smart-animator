import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { Sparkles, TrendingUp, Target, AlertCircle, Check, X } from './Icons';

interface AIInsight {
  id: string;
  insightType: string;
  title: string;
  description: string;
  recommendation: string;
  confidenceScore: number;
  impactScore: number;
  status: string;
  createdAt: string;
}

const AIInsightsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied' | 'dismissed'>('pending');

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, filter]);

  const loadInsights = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInsights(data.map(item => ({
        id: item.id,
        insightType: item.insight_type,
        title: item.title,
        description: item.description,
        recommendation: item.recommendation,
        confidenceScore: item.confidence_score,
        impactScore: item.impact_score,
        status: item.status,
        createdAt: item.created_at
      })));
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', insightId);

      if (error) throw error;
      loadInsights();
    } catch (error) {
      console.error('Error applying insight:', error);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ status: 'dismissed' })
        .eq('id', insightId);

      if (error) throw error;
      loadInsights();
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactBadge = (score: number) => {
    if (score >= 0.8) return 'bg-red-100 text-red-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Insights</h1>
          <p className="text-gray-600">Recommendations powered by AI analysis</p>
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'applied', 'dismissed'] as const).map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No insights found</p>
          <p className="text-sm text-gray-500 mt-2">
            AI will generate insights as you use the platform
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getInsightIcon(insight.insightType)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {insight.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className={`font-semibold ${getConfidenceColor(insight.confidenceScore)}`}>
                            {Math.round(insight.confidenceScore * 100)}%
                          </span>
                          confidence
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactBadge(insight.impactScore)}`}>
                          {insight.impactScore >= 0.8 ? 'High' : insight.impactScore >= 0.6 ? 'Medium' : 'Low'} Impact
                        </span>
                        <span className="text-gray-400">
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{insight.description}</p>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Recommendation</p>
                    <p className="text-blue-800">{insight.recommendation}</p>
                  </div>

                  {insight.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => applyInsight(insight.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                      <Button
                        onClick={() => dismissInsight(insight.id)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {insight.status === 'applied' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-semibold">Applied</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsightsDashboard;
