import React, { useState, useEffect } from 'react';
import { campaignService } from '../services/campaignService';
import { CampaignRecipient } from '../types';
import Button from './Button';
import PersonalizationPreview from './PersonalizationPreview';
import { Eye, Mail, RefreshCw } from './Icons';

interface RecipientManagerProps {
  campaignId: string;
  onBack?: () => void;
}

const RecipientManager: React.FC<RecipientManagerProps> = ({ campaignId, onBack }) => {
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  useEffect(() => {
    loadRecipients();
  }, [campaignId, statusFilter]);

  const loadRecipients = async () => {
    setLoading(true);
    const data = await campaignService.getRecipients(
      campaignId,
      statusFilter === 'all' ? undefined : statusFilter
    );
    setRecipients(data);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-slate-700 text-slate-300',
      processing: 'bg-blue-700 text-blue-300',
      ready: 'bg-green-700 text-green-300',
      sent: 'bg-emerald-700 text-emerald-300',
      failed: 'bg-red-700 text-red-300',
      viewed: 'bg-purple-700 text-purple-300'
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          colors[status as keyof typeof colors] || colors.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const statusCounts = recipients.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {selectedRecipient && (
        <PersonalizationPreview
          recipientId={selectedRecipient}
          onClose={() => setSelectedRecipient(null)}
        />
      )}
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign Recipients</h2>
          <p className="text-slate-400 text-sm mt-1">{recipients.length} total recipients</p>
        </div>
        {onBack && (
          <Button onClick={onBack} variant="secondary">
            Back to Campaigns
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'processing', 'ready', 'sent', 'failed', 'viewed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading recipients...</div>
        </div>
      ) : recipients.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-slate-400">No recipients found</div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        {recipient.first_name} {recipient.last_name}
                      </div>
                      <div className="text-sm text-slate-400">{recipient.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{recipient.company || '-'}</div>
                      {recipient.role && (
                        <div className="text-sm text-slate-400">{recipient.role}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(recipient.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-white">
                        {recipient.generation_cost
                          ? `$${recipient.generation_cost.toFixed(3)}`
                          : '-'}
                      </div>
                      {recipient.processing_time_ms && (
                        <div className="text-sm text-slate-400">
                          {(recipient.processing_time_ms / 1000).toFixed(1)}s
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRecipient(recipient.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="View personalization"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        {recipient.status === 'ready' && (
                          <button
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                        {recipient.status === 'failed' && (
                          <button
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Retry"
                          >
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default RecipientManager;
