import React, { useState, useEffect } from 'react';
import { prospectIntelligenceService, ProspectData, IntelligenceReport } from '../services/openai/prospectIntelligence';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { Search, TrendingUp, Calendar, Lightbulb, Building, RefreshCw } from './Icons';

interface ProspectIntelligenceProps {
  prospect: ProspectData;
  onClose?: () => void;
}

const ProspectIntelligence: React.FC<ProspectIntelligenceProps> = ({ prospect, onClose }) => {
  const { user } = useAuth();
  const [intelligence, setIntelligence] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntelligence();
  }, [prospect.contactId]);

  const loadIntelligence = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const existing = await prospectIntelligenceService.getIntelligence(prospect.contactId, user.id);

      if (existing) {
        setIntelligence(existing);
      } else {
        await research();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const research = async () => {
    if (!user) return;

    setRefreshing(true);
    setError(null);

    try {
      const report = await prospectIntelligenceService.researchProspect(prospect, user.id);
      setIntelligence(report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Researching prospect...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <Button
          onClick={loadIntelligence}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">No intelligence data available</p>
        <Button
          onClick={research}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Search className="w-4 h-4 mr-2" />
          Research Prospect
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {prospect.firstName} {prospect.lastName}
              </h2>
              {prospect.role && <p className="text-blue-100">{prospect.role}</p>}
              {prospect.company && (
                <p className="text-blue-100 flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4" />
                  {prospect.company}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={research}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {onClose && (
                <Button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Company Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">{intelligence.companyInfo.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Size</p>
                  <p className="font-semibold text-gray-900">{intelligence.companyInfo.size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funding</p>
                  <p className="font-semibold text-gray-900">{intelligence.companyInfo.funding}</p>
                </div>
              </div>
              {intelligence.companyInfo.techStack && intelligence.companyInfo.techStack.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.companyInfo.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {intelligence.recentNews.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Recent News
              </h3>
              <div className="space-y-3">
                {intelligence.recentNews.map((news, idx) => (
                  <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-1">{news.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{news.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{news.date}</span>
                      <span className="text-green-600 font-medium">{news.relevance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {intelligence.triggerEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Trigger Events
              </h3>
              <div className="space-y-3">
                {intelligence.triggerEvents.map((event, idx) => (
                  <div key={idx} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{event.event}</h4>
                      <span className="text-xs text-gray-600">{event.date}</span>
                    </div>
                    <p className="text-sm text-purple-800 bg-purple-100 rounded px-3 py-2">
                      <strong>Opportunity:</strong> {event.opportunity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Personalization Suggestions
            </h3>
            <div className="space-y-3">
              {intelligence.personalizationSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-xs font-semibold">
                      {suggestion.type}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-800 mt-2">{suggestion.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectIntelligence;
