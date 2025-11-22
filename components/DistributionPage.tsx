import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { contactService, type Contact, type Campaign } from '../services/contactService';
import { databaseService, type VideoGeneration } from '../services/supabase';
import { ollamaService, type PersonalizationContext } from '../services/ollamaService';
import { emailService } from '../services/emailService';
import { Send, Users, Sparkles, Mail, MessageCircle, Share2, X, Check } from './Icons';

export const DistributionPage: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoGeneration | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [campaignName, setCampaignName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [ollamaStatus, setOllamaStatus] = useState({ available: false, host: '' });

  useEffect(() => {
    if (user) {
      loadData();
      checkOllama();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const videosData = await databaseService.getVideoGenerations(user.id, 20);
    const contactsData = await contactService.getContacts(user.id);
    setVideos(videosData.filter(v => v.status === 'completed'));
    setContacts(contactsData);
  };

  const checkOllama = async () => {
    const status = ollamaService.getStatus();
    setOllamaStatus(status);
    const connected = await ollamaService.checkConnection();
    setOllamaStatus({ ...status, available: connected });
  };

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id!)));
    }
  };

  const handleSendCampaign = async () => {
    if (!user || !selectedVideo || selectedContacts.size === 0) return;

    setSending(true);
    setProgress({ current: 0, total: selectedContacts.size });

    const campaign = await contactService.createCampaign(user.id, {
      name: campaignName || `Campaign for ${selectedVideo.title}`,
      video_id: selectedVideo.id,
      subject: subject,
      message_template: messageTemplate,
      channels: ['email'],
      status: 'sending',
    });

    if (!campaign) {
      setSending(false);
      alert('Failed to create campaign');
      return;
    }

    let successCount = 0;
    const selectedContactsList = contacts.filter(c => selectedContacts.has(c.id!));

    for (let i = 0; i < selectedContactsList.length; i++) {
      const contact = selectedContactsList[i];
      setProgress({ current: i + 1, total: selectedContactsList.length });

      try {
        let personalizedSubject = subject;
        let personalizedMessage = messageTemplate;

        if (useAI && ollamaStatus.available) {
          const context: PersonalizationContext = {
            firstName: contact.first_name,
            lastName: contact.last_name,
            company: contact.company,
            industry: contact.industry,
            email: contact.email,
          };

          if (subject) {
            personalizedSubject = await ollamaService.generateEmailSubject(
              context,
              subject,
              {}
            );
          }

          if (messageTemplate) {
            personalizedMessage = await ollamaService.generateEmailBody(
              context,
              messageTemplate,
              selectedVideo.title,
              {}
            );
          }
        } else {
          personalizedMessage = await ollamaService.personalizeTemplate(
            messageTemplate,
            {
              firstName: contact.first_name,
              lastName: contact.last_name,
              company: contact.company,
              industry: contact.industry,
              email: contact.email,
            }
          );
        }

        const send = await contactService.createSend({
          campaign_id: campaign.id!,
          contact_id: contact.id!,
          channel: 'email',
          status: 'pending',
          personalized_subject: personalizedSubject,
          personalized_message: personalizedMessage,
        });

        if (send && contact.email) {
          const emailHtml = emailService.createEmailTemplate(
            selectedVideo.video_url || '',
            selectedVideo.title,
            personalizedMessage,
            contact.first_name
          );

          const result = await emailService.sendEmailWithTracking({
            to: contact.email,
            subject: personalizedSubject,
            html: emailHtml,
            trackingId: send.id,
          });

          if (result.success) {
            await contactService.updateSend(send.id!, {
              status: 'sent',
              sent_at: new Date().toISOString(),
            });
            successCount++;
          } else {
            await contactService.updateSend(send.id!, {
              status: 'failed',
              error_message: result.error,
            });
          }
        }
      } catch (error) {
        console.error('Error sending to contact:', contact.email, error);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await contactService.updateCampaign(campaign.id!, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    setSending(false);
    alert(`Campaign completed! Sent ${successCount} out of ${selectedContacts.size} emails.`);
    setSelectedVideo(null);
    setSelectedContacts(new Set());
    setCampaignName('');
    setMessageTemplate('');
    setSubject('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Video Distribution</h2>
          <p className="text-slate-400">Send personalized video messages to your contacts</p>
        </div>
        {ollamaStatus.available ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">AI Personalization Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 text-sm">Ollama not connected</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5" />
              1. Select Video
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {videos.length === 0 ? (
                <p className="text-slate-400 text-sm">No completed videos available</p>
              ) : (
                videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedVideo?.id === video.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }`}
                  >
                    <div className="font-medium text-white">{video.title}</div>
                    <div className="text-sm text-slate-400 mt-1">{video.prompt.substring(0, 100)}...</div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                2. Select Recipients ({selectedContacts.size})
              </h3>
              <button
                onClick={selectAll}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {selectedContacts.size === contacts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-slate-400 text-sm">No contacts available</p>
              ) : (
                contacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id!)}
                      onChange={() => toggleContact(contact.id!)}
                      className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-slate-400 text-xs">{contact.email || contact.phone}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              3. Customize Message
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="My Video Campaign"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Check out this video"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message Template
                </label>
                <textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="I wanted to share this video with you..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Use merge tags: {'{'}firstName{'}'}, {'{'}lastName{'}'}, {'{'}company{'}'}, {'{'}industry{'}'}
                </p>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  disabled={!ollamaStatus.available}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    AI Personalization
                  </div>
                  <div className="text-slate-400 text-xs">
                    {ollamaStatus.available
                      ? 'Generate unique messages for each recipient'
                      : 'Requires Ollama to be running'}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSendCampaign}
            disabled={!selectedVideo || selectedContacts.size === 0 || sending}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Sending {progress.current}/{progress.total}...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Campaign
              </>
            )}
          </button>

          {sending && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
