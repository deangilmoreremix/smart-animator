import React, { useState, useEffect } from 'react';
import { campaignService } from '../services/campaignService';
import { personalizationEngine } from '../services/personalizationEngine';
import { CampaignRecipient } from '../types';
import Button from './Button';
import { X, RefreshCw, Download, CheckCircle } from './Icons';

interface PersonalizationPreviewProps {
  recipientId: string;
  onClose?: () => void;
  onApprove?: () => void;
}

const PersonalizationPreview: React.FC<PersonalizationPreviewProps> = ({
  recipientId,
  onClose,
  onApprove
}) => {
  const [recipient, setRecipient] = useState<CampaignRecipient | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [recipientId]);

  const loadData = async () => {
    setLoading(true);
    const recipientData = await campaignService.getRecipient(recipientId);
    const assetsData = await personalizationEngine.getAssets(recipientId);
    setRecipient(recipientData);
    setAssets(assetsData);
    setLoading(false);
  };

  const getAssetsByType = (type: string) => {
    return assets.filter(a => a.type === type);
  };

  if (loading || !recipient) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full mx-4">
          <div className="text-white text-center">Loading preview...</div>
        </div>
      </div>
    );
  }

  const introAssets = getAssetsByType('intro');
  const ctaAssets = getAssetsByType('cta');
  const brollAssets = getAssetsByType('broll');
  const captionAssets = getAssetsByType('caption');
  const backgroundAssets = getAssetsByType('background');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full my-8">
        <div className="border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Personalization Preview
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {recipient.first_name} {recipient.last_name} • {recipient.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Recipient Info</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="text-white">
                    {recipient.first_name} {recipient.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Company:</span>{' '}
                  <span className="text-white">{recipient.company || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Role:</span>{' '}
                  <span className="text-white">{recipient.role || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Industry:</span>{' '}
                  <span className="text-white">{recipient.industry || '-'}</span>
                </div>
                {recipient.pain_point && (
                  <div>
                    <span className="text-slate-400">Pain Point:</span>{' '}
                    <span className="text-white">{recipient.pain_point}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Generation Stats</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Status:</span>{' '}
                  <span
                    className={`font-medium ${
                      recipient.status === 'ready'
                        ? 'text-green-400'
                        : recipient.status === 'failed'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {recipient.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Cost:</span>{' '}
                  <span className="text-white">
                    ${recipient.generation_cost?.toFixed(3) || '0.000'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Processing Time:</span>{' '}
                  <span className="text-white">
                    {recipient.processing_time_ms
                      ? `${(recipient.processing_time_ms / 1000).toFixed(1)}s`
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Assets Generated:</span>{' '}
                  <span className="text-white">{assets.length}</span>
                </div>
              </div>
            </div>
          </div>

          {introAssets.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Personalized Intro
              </h3>
              {introAssets.map((asset, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-white text-lg">{asset.data?.text}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    Generated in {asset.generationTime}ms
                  </p>
                </div>
              ))}
            </div>
          )}

          {captionAssets.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Email Subject Lines & Content
              </h3>
              <div className="space-y-3">
                {captionAssets.map((asset, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                    {asset.data?.subjects && (
                      <div className="mb-3">
                        <p className="text-slate-400 text-xs uppercase mb-2">
                          Subject Options
                        </p>
                        {asset.data.subjects.map((subject: string, j: number) => (
                          <div
                            key={j}
                            className="text-white text-sm py-1 border-l-2 border-blue-500 pl-3 mb-1"
                          >
                            {subject}
                          </div>
                        ))}
                      </div>
                    )}
                    {asset.data?.emailBody && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase mb-2">Email Body</p>
                        <p className="text-white whitespace-pre-wrap">{asset.data.emailBody}</p>
                      </div>
                    )}
                    {asset.data?.adaptedScript && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase mb-2">
                          Role-Adapted Script ({asset.data.role})
                        </p>
                        <p className="text-white whitespace-pre-wrap">{asset.data.adaptedScript}</p>
                      </div>
                    )}
                    {asset.data?.insights && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase mb-2">Company Insights</p>
                        <p className="text-white whitespace-pre-wrap">{asset.data.insights}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ctaAssets.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Call-to-Action
              </h3>
              {ctaAssets.map((asset, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                    {asset.data?.text}
                  </div>
                  {asset.data?.painPoint && (
                    <p className="text-slate-400 text-sm mt-2">
                      Addresses: {asset.data.painPoint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {brollAssets.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Industry Visuals
              </h3>
              {brollAssets.map((asset, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-xs uppercase mb-2">
                    {asset.data?.industry || 'Business'} Industry
                  </p>
                  <p className="text-white">{asset.data?.description}</p>
                </div>
              ))}
            </div>
          )}

          {backgroundAssets.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                Dynamic Background
              </h3>
              {backgroundAssets.map((asset, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-xs uppercase mb-2">Veo Prompt</p>
                  <p className="text-white">{asset.data?.veoPrompt}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-6 flex gap-4 justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          {recipient.personalized_video_url && (
            <Button variant="secondary" icon={<Download className="w-5 h-5" />}>
              Download Video
            </Button>
          )}
          {onApprove && recipient.status === 'ready' && (
            <Button onClick={onApprove} icon={<CheckCircle className="w-5 h-5" />}>
              Approve & Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPreview;
