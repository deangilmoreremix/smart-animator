import React, { useState, useEffect } from 'react';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { prospectIntelligenceService } from '../services/openai/prospectIntelligence';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import VoiceRecorder from './VoiceRecorder';
import { Sparkles, Mic, Edit, Send, TrendingUp } from './Icons';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  role?: string;
  industry?: string;
}

interface AIEnhancedCampaignWizardProps {
  videoUrl?: string;
  onComplete: (campaign: any) => void;
  onCancel: () => void;
}

const AIEnhancedCampaignWizard: React.FC<AIEnhancedCampaignWizardProps> = ({
  videoUrl,
  onComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [useVoice, setUseVoice] = useState(false);

  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [personalizedMessages, setPersonalizedMessages] = useState<Record<string, {
    subject: string[];
    body: string;
    cta: string[];
    intelligence?: any;
  }>>({});
  const [generating, setGenerating] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);

  const handleVoiceInput = (transcript: string) => {
    if (step === 1) {
      setCampaignGoal(transcript);
    } else if (step === 2) {
      setTargetAudience(transcript);
    }
  };

  const generatePersonalizedContent = async () => {
    if (!user || selectedContacts.length === 0) return;

    setGenerating(true);
    const messages: Record<string, any> = {};

    for (let i = 0; i < selectedContacts.length; i++) {
      setCurrentContactIndex(i);
      const contact = selectedContacts[i];

      try {
        const intelligence = await prospectIntelligenceService.refreshIfStale(
          {
            contactId: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            company: contact.company,
            industry: contact.industry,
            role: contact.role,
            email: contact.email
          },
          user.id,
          168
        );

        const context = {
          firstName: contact.firstName,
          lastName: contact.lastName,
          company: contact.company,
          industry: contact.industry,
          role: contact.role,
          painPoint: intelligence.personalizationSuggestions[0]?.suggestion
        };

        const [subjects, body, ctas] = await Promise.all([
          aiOrchestrator.generateEmailSubject(context, campaignGoal, user.id),
          aiOrchestrator.generateEmailBody(context, campaignGoal, videoUrl || '', user.id),
          aiOrchestrator.generateCTA(context, campaignGoal, user.id)
        ]);

        messages[contact.id] = {
          subject: subjects,
          body,
          cta: ctas,
          intelligence
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating content for ${contact.email}:`, error);

        messages[contact.id] = {
          subject: [`${contact.firstName}, ${campaignGoal}`],
          body: `Hi ${contact.firstName},\n\nI wanted to share this with you.\n\nBest regards`,
          cta: ['Learn More'],
          intelligence: null
        };
      }
    }

    setPersonalizedMessages(messages);
    setGenerating(false);
    setStep(4);
  };

  const sendCampaign = async () => {
    const campaign = {
      goal: campaignGoal,
      audience: targetAudience,
      contacts: selectedContacts,
      videoUrl,
      personalizedMessages,
      createdAt: new Date().toISOString()
    };

    onComplete(campaign);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">AI-Enhanced Campaign Wizard</h2>
          <p className="text-blue-100">Step {step} of 4</p>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  What's your campaign goal?
                </h3>
                <p className="text-gray-600 mb-4">
                  Describe what you want to achieve with this campaign
                </p>

                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => setUseVoice(!useVoice)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      useVoice
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {useVoice ? 'Using Voice' : 'Use Voice'}
                  </Button>
                </div>

                {useVoice ? (
                  <VoiceRecorder
                    onTranscript={handleVoiceInput}
                    mode="simple"
                  />
                ) : (
                  <textarea
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    placeholder="E.g., Schedule demos with enterprise SaaS companies"
                    className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={onCancel}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!campaignGoal}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Who's your target audience?
                </h3>
                <p className="text-gray-600 mb-4">
                  Describe your ideal customer profile
                </p>

                {useVoice ? (
                  <VoiceRecorder
                    onTranscript={handleVoiceInput}
                    mode="simple"
                  />
                ) : (
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="E.g., VP of Sales at B2B SaaS companies with 50-200 employees"
                    className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!targetAudience}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Select contacts for this campaign
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose recipients who match your target audience
                </p>

                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600">
                    Contact selection UI would go here
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    For demo: Add a mock contact
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedContacts([{
                        id: '1',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                        company: 'Acme Corp',
                        role: 'VP of Sales',
                        industry: 'SaaS'
                      }]);
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Add Demo Contact
                  </Button>
                </div>

                {selectedContacts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Selected: {selectedContacts.length} contacts
                    </p>
                    <div className="space-y-2">
                      {selectedContacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {contact.role} at {contact.company}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={generatePersonalizedContent}
                  disabled={selectedContacts.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate AI Content
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {generating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Generating personalized content...
                  </p>
                  <p className="text-gray-600">
                    Processing contact {currentContactIndex + 1} of {selectedContacts.length}
                  </p>
                  <div className="mt-4 max-w-md mx-auto bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentContactIndex + 1) / selectedContacts.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Review & Send Campaign
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Review AI-generated personalized content for each contact
                    </p>

                    <div className="space-y-4">
                      {selectedContacts.map(contact => {
                        const message = personalizedMessages[contact.id];
                        if (!message) return null;

                        return (
                          <div key={contact.id} className="border-2 border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-bold text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{contact.email}</p>
                              </div>
                              {message.intelligence && (
                                <Button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                  View Intelligence
                                </Button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  Subject Options:
                                </p>
                                {message.subject.map((subj, idx) => (
                                  <p key={idx} className="text-sm text-gray-800 mb-1">
                                    • {subj}
                                  </p>
                                ))}
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  Email Body:
                                </p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                  {message.body}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  CTA Options:
                                </p>
                                <div className="flex gap-2">
                                  {message.cta.map((cta, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                    >
                                      {cta}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t-2 border-gray-200">
                    <Button
                      onClick={() => setStep(3)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={sendCampaign}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg flex items-center gap-2 text-lg font-semibold"
                    >
                      <Send className="w-5 h-5" />
                      Launch Campaign
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedCampaignWizard;
