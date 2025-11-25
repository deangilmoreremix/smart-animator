import { supabase } from './supabase';
import { Campaign, CampaignRecipient, CampaignAnalytics } from '../types';

export interface CreateCampaignData {
  name: string;
  master_video_id?: string;
  template_script?: string;
  personalization_tier?: 'basic' | 'smart' | 'advanced';
  personalization_fields?: string[];
  visual_style?: Record<string, any>;
  message_template?: string;
  subject?: string;
}

export interface RecipientData {
  email: string;
  first_name: string;
  last_name?: string;
  company?: string;
  role?: string;
  industry?: string;
  pain_point?: string;
  custom_fields?: Record<string, any>;
}

class CampaignService {
  async createCampaign(userId: string, data: CreateCampaignData): Promise<Campaign | null> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId,
          name: data.name,
          master_video_id: data.master_video_id,
          video_id: data.master_video_id,
          template_script: data.template_script,
          personalization_tier: data.personalization_tier || 'basic',
          personalization_fields: data.personalization_fields || [],
          visual_style: data.visual_style,
          message_template: data.message_template || '',
          subject: data.subject,
          status: 'draft',
          processing_status: 'draft',
          total_recipients: 0
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('campaign_analytics')
        .insert({
          campaign_id: campaign.id,
          total_recipients: 0,
          videos_generated: 0,
          videos_sent: 0,
          total_views: 0,
          unique_views: 0,
          total_cost: 0
        });

      return campaign as Campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Campaign[]) || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data as Campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return false;
    }
  }

  async pauseCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          processing_status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error pausing campaign:', error);
      return false;
    }
  }

  async resumeCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          processing_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resuming campaign:', error);
      return false;
    }
  }

  async cancelCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          processing_status: 'cancelled',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      await supabase
        .from('campaign_recipients')
        .update({ status: 'cancelled' })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');

      return true;
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      return false;
    }
  }

  async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  async addRecipients(campaignId: string, recipients: RecipientData[]): Promise<{ success: number; failed: number }> {
    try {
      const recipientRecords = recipients.map(r => ({
        campaign_id: campaignId,
        email: r.email,
        first_name: r.first_name,
        last_name: r.last_name,
        company: r.company,
        role: r.role,
        industry: r.industry,
        pain_point: r.pain_point,
        custom_fields: r.custom_fields || {},
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('campaign_recipients')
        .insert(recipientRecords)
        .select();

      if (error) throw error;

      await supabase
        .from('campaigns')
        .update({
          total_recipients: recipients.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      return { success: data?.length || 0, failed: 0 };
    } catch (error) {
      console.error('Error adding recipients:', error);
      return { success: 0, failed: recipients.length };
    }
  }

  async getRecipients(campaignId: string, status?: string): Promise<CampaignRecipient[]> {
    try {
      let query = supabase
        .from('campaign_recipients')
        .select('*')
        .eq('campaign_id', campaignId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return (data as CampaignRecipient[]) || [];
    } catch (error) {
      console.error('Error fetching recipients:', error);
      return [];
    }
  }

  async getRecipient(recipientId: string): Promise<CampaignRecipient | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_recipients')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (error) throw error;
      return data as CampaignRecipient;
    } catch (error) {
      console.error('Error fetching recipient:', error);
      return null;
    }
  }

  async updateRecipient(recipientId: string, updates: Partial<CampaignRecipient>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaign_recipients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', recipientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating recipient:', error);
      return false;
    }
  }

  async deleteRecipient(recipientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaign_recipients')
        .delete()
        .eq('id', recipientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recipient:', error);
      return false;
    }
  }

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) throw error;
      return data as CampaignAnalytics;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      return null;
    }
  }

  async updateCampaignAnalytics(campaignId: string, updates: Partial<CampaignAnalytics>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaign_analytics')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('campaign_id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating campaign analytics:', error);
      return false;
    }
  }

  parseCSV(csvText: string): RecipientData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const recipients: RecipientData[] = [];

    const emailIndex = headers.findIndex(h => h === 'email');
    const firstNameIndex = headers.findIndex(h => h === 'first_name' || h === 'firstname' || h === 'first name');
    const lastNameIndex = headers.findIndex(h => h === 'last_name' || h === 'lastname' || h === 'last name');
    const companyIndex = headers.findIndex(h => h === 'company');
    const roleIndex = headers.findIndex(h => h === 'role' || h === 'title' || h === 'job_title');
    const industryIndex = headers.findIndex(h => h === 'industry');
    const painPointIndex = headers.findIndex(h => h === 'pain_point' || h === 'painpoint' || h === 'pain point');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (emailIndex === -1 || firstNameIndex === -1) continue;
      if (!values[emailIndex] || !values[firstNameIndex]) continue;

      const customFields: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (![emailIndex, firstNameIndex, lastNameIndex, companyIndex, roleIndex, industryIndex, painPointIndex].includes(index)) {
          customFields[header] = values[index];
        }
      });

      recipients.push({
        email: values[emailIndex],
        first_name: values[firstNameIndex],
        last_name: lastNameIndex >= 0 ? values[lastNameIndex] : undefined,
        company: companyIndex >= 0 ? values[companyIndex] : undefined,
        role: roleIndex >= 0 ? values[roleIndex] : undefined,
        industry: industryIndex >= 0 ? values[industryIndex] : undefined,
        pain_point: painPointIndex >= 0 ? values[painPointIndex] : undefined,
        custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined
      });
    }

    return recipients;
  }

  estimateCost(recipientCount: number, tier: 'basic' | 'smart' | 'advanced'): { total: number; perVideo: number; estimatedTime: string } {
    const costPerVideo = {
      basic: 0.02,
      smart: 0.05,
      advanced: 0.15
    };

    const timePerVideo = {
      basic: 30,
      smart: 60,
      advanced: 120
    };

    const total = recipientCount * costPerVideo[tier];
    const totalSeconds = recipientCount * timePerVideo[tier];
    const minutes = Math.floor(totalSeconds / 60);

    return {
      total,
      perVideo: costPerVideo[tier],
      estimatedTime: `${minutes} minute${minutes !== 1 ? 's' : ''}`
    };
  }
}

export const campaignService = new CampaignService();
