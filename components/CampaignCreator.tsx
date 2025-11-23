import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { campaignService } from '../services/campaignService';
import { batchProcessingService } from '../services/batchProcessingService';
import Button from './Button';
import { Upload, Zap, DollarSign, Clock } from './Icons';

interface CampaignCreatorProps {
  onComplete?: (campaignId: string) => void;
  onCancel?: () => void;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [tier, setTier] = useState<'basic' | 'smart' | 'advanced'>('basic');
  const [csvText, setCsvText] = useState('');
  const [goal, setGoal] = useState('Schedule a call');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const recipients = campaignService.parseCSV(text);
      setTotalRecipients(recipients.length);
    };
    reader.readAsText(file);
  };

  const handleLaunch = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const campaign = await campaignService.createCampaign(user.id, {
        name: campaignName,
        personalization_tier: tier,
        message_template: goal
      });

      if (!campaign) throw new Error('Failed to create campaign');

      const recipients = campaignService.parseCSV(csvText);
      await campaignService.addRecipients(campaign.id, recipients);

      await batchProcessingService.processCampaignTier1(
        campaign.id,
        goal,
        (current, total) => {
          setProgress((current / total) * 100);
        }
      );

      if (onComplete) onComplete(campaign.id);
    } catch (err: any) {
      setError(err.message || 'Failed to launch campaign');
      setIsProcessing(false);
    }
  };

  const costEstimate = campaignService.estimateCost(totalRecipients, tier);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create Personalization Campaign</h2>

        <div className="flex items-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-slate-800'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Q1 2024 Cold Outreach"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Goal / CTA</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Schedule a call"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={onCancel} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} disabled={!campaignName}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Select Personalization Tier
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    id: 'basic' as const,
                    name: 'Basic',
                    price: '$0.02/video',
                    features: ['Text overlays', 'Name personalization', 'Company mentions']
                  },
                  {
                    id: 'smart' as const,
                    name: 'Smart',
                    price: '$0.05/video',
                    features: ['Everything in Basic', 'Industry visuals', 'Role-based messaging']
                  },
                  {
                    id: 'advanced' as const,
                    name: 'Advanced',
                    price: '$0.15/video',
                    features: ['Everything in Smart', 'Dynamic backgrounds', 'Company research']
                  }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      tier === t.id
                        ? 'border-blue-600 bg-blue-600/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{t.name}</div>
                    <div className="text-sm text-blue-400 mb-3">{t.price}</div>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {t.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={() => setStep(1)} variant="secondary">
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Upload Recipients CSV
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Required columns: email, first_name. Optional: last_name, company, role, industry,
                pain_point
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={isProcessing}
              />
              <label htmlFor="csv-upload">
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition-colors">
                  <Upload className="w-12 h-12 text-slate-600 mb-3" />
                  <div className="text-white font-medium">
                    {totalRecipients > 0
                      ? `${totalRecipients} recipients loaded`
                      : 'Click to upload CSV'}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">or drag and drop</div>
                </div>
              </label>
            </div>

            {totalRecipients > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Cost Estimate</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center text-slate-400 text-sm mb-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Total Cost
                    </div>
                    <div className="text-2xl font-bold text-white">
                      ${costEstimate.total.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-slate-400 text-sm mb-1">
                      <Zap className="w-4 h-4 mr-1" />
                      Per Video
                    </div>
                    <div className="text-2xl font-bold text-white">
                      ${costEstimate.perVideo.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-slate-400 text-sm mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      Est. Time
                    </div>
                    <div className="text-2xl font-bold text-white">{costEstimate.estimatedTime}</div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isProcessing && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
                <div className="text-white font-semibold mb-2">Processing Campaign...</div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-sm text-slate-400 mt-2">{Math.round(progress)}% complete</div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={() => setStep(2)} variant="secondary" disabled={isProcessing}>
                Back
              </Button>
              <Button
                onClick={handleLaunch}
                disabled={totalRecipients === 0 || isProcessing}
                isLoading={isProcessing}
              >
                Launch Campaign
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCreator;
