import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { campaignService } from '../services/campaignService';
import { batchProcessingService } from '../services/batchProcessingService';
import Button from './Button';
import { X, Upload, Zap, DollarSign, Users, CheckCircle } from './Icons';

interface InlineCampaignWizardProps {
  videoUrl: string;
  onClose: () => void;
  onComplete?: () => void;
}

const InlineCampaignWizard: React.FC<InlineCampaignWizardProps> = ({
  videoUrl,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [tier, setTier] = useState<'basic' | 'smart' | 'advanced'>('smart');
  const [baseScript, setBaseScript] = useState('');
  const [csvText, setCsvText] = useState('');
  const [goal, setGoal] = useState('Schedule a call');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

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
    setStep(4);

    try {
      const campaign = await campaignService.createCampaign(user.id, {
        name: campaignName,
        personalization_tier: tier,
        template_script: baseScript,
        message_template: goal,
        master_video_url: videoUrl
      });

      if (!campaign) throw new Error('Failed to create campaign');

      const recipients = campaignService.parseCSV(csvText);
      await campaignService.addRecipients(campaign.id, recipients);

      const summary = await batchProcessingService.processCampaign(
        campaign.id,
        tier,
        baseScript,
        goal,
        (current, total) => {
          setProgress((current / total) * 100);
        }
      );

      setSuccessCount(summary.successful);
      setStep(5);
    } catch (error: any) {
      console.error('Campaign launch error:', error);
      alert(error.message || 'Failed to launch campaign');
      setIsProcessing(false);
    }
  };

  const estimateCost = () => {
    const costPerVideo = tier === 'basic' ? 0.02 : tier === 'smart' ? 0.05 : 0.15;
    return (totalRecipients * costPerVideo).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full my-8 border border-slate-700">
        <div className="border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Create Personalized Campaign
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {step === 1 && 'Choose your personalization tier'}
              {step === 2 && 'Add recipients and configure'}
              {step === 3 && 'Review and launch'}
              {step === 4 && 'Generating personalized videos...'}
              {step === 5 && 'Campaign ready!'}
            </p>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Q1 2024 Outreach"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Select Personalization Tier
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'basic' as const, name: 'Basic', price: '$0.02/video', features: ['Name personalization', '3 subject lines', 'Custom CTAs'] },
                    { id: 'smart' as const, name: 'Smart', price: '$0.05/video', features: ['Everything in Basic', 'Industry visuals', 'Role-based messaging'] },
                    { id: 'advanced' as const, name: 'Advanced', price: '$0.15/video', features: ['Everything in Smart', 'Company research', 'Dynamic backgrounds'] }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        tier === t.id
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{t.name}</h4>
                        <span className="text-sm text-purple-400 font-medium">{t.price}</span>
                      </div>
                      <ul className="space-y-1">
                        {t.features.map((f, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start">
                            <span className="text-purple-400 mr-1">•</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={onClose} variant="secondary">Cancel</Button>
                <Button onClick={() => setStep(2)} disabled={!campaignName}>Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Upload Recipients (CSV)
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">
                      {totalRecipients > 0
                        ? `${totalRecipients} recipients loaded`
                        : 'Click to upload CSV file'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Required: email, first_name. Optional: last_name, company, role, industry
                    </p>
                  </label>
                </div>
              </div>

              {tier !== 'basic' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Base Script (for {tier} tier)
                  </label>
                  <textarea
                    value={baseScript}
                    onChange={(e) => setBaseScript(e.target.value)}
                    placeholder="Enter your base video script. This will be adapted based on each recipient's role and industry."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Goal / CTA</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Schedule a call"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={() => setStep(1)} variant="secondary">Back</Button>
                <Button onClick={() => setStep(3)} disabled={totalRecipients === 0}>Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Campaign Name:</span>
                  <span className="text-white font-medium">{campaignName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tier:</span>
                  <span className="text-white font-medium capitalize">{tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Recipients:</span>
                  <span className="text-white font-medium">{totalRecipients}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                  <span className="text-slate-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Estimated Cost:
                  </span>
                  <span className="text-purple-400 font-bold text-lg">${estimateCost()}</span>
                </div>
              </div>

              <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Ready to launch!</strong> Your campaign will generate {totalRecipients} personalized
                  videos using AI. This typically takes 2-5 minutes.
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <Button onClick={() => setStep(2)} variant="secondary">Back</Button>
                <Button onClick={handleLaunch}>Launch Campaign</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Generating Personalized Videos
              </h3>
              <p className="text-slate-400 mb-6">
                AI is creating customized versions for each recipient...
              </p>
              <div className="max-w-md mx-auto">
                <div className="bg-slate-950 rounded-full h-3 overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-slate-500 text-sm">{Math.round(progress)}% Complete</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Campaign Ready!
              </h3>
              <p className="text-slate-400 mb-6">
                Successfully generated {successCount} personalized videos
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={onClose} variant="secondary">Close</Button>
                <Button onClick={() => {
                  onComplete?.();
                  onClose();
                }}>
                  View Campaign
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineCampaignWizard;
