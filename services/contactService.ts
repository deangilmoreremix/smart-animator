import { supabase } from './supabase';

export interface Contact {
  id?: string;
  user_id?: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name?: string;
  company?: string;
  industry?: string;
  custom_fields?: Record<string, any>;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ContactList {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  contact_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id?: string;
  user_id?: string;
  video_id?: string;
  name: string;
  subject?: string;
  message_template: string;
  channels?: string[];
  status?: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Send {
  id?: string;
  campaign_id: string;
  contact_id: string;
  channel: string;
  status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  personalized_subject?: string;
  personalized_message?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at?: string;
}

class ContactService {
  async createContact(userId: string, contact: Contact): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, user_id: userId })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating contact:', error);
      return null;
    }

    return data;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating contact:', error);
      return null;
    }

    return data;
  }

  async deleteContact(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      return false;
    }

    return true;
  }

  async getContacts(userId: string, limit: number = 100): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }

    return data || [];
  }

  async getContact(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching contact:', error);
      return null;
    }

    return data;
  }

  async searchContacts(userId: string, query: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .limit(50);

    if (error) {
      console.error('Error searching contacts:', error);
      return [];
    }

    return data || [];
  }

  async importContacts(userId: string, contacts: Contact[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const contact of contacts) {
      const result = await this.createContact(userId, contact);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  async createList(userId: string, list: ContactList): Promise<ContactList | null> {
    const { data, error } = await supabase
      .from('lists')
      .insert({ ...list, user_id: userId })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating list:', error);
      return null;
    }

    return data;
  }

  async getLists(userId: string): Promise<ContactList[]> {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lists:', error);
      return [];
    }

    return data || [];
  }

  async addContactToList(listId: string, contactId: string): Promise<boolean> {
    const { error } = await supabase
      .from('list_contacts')
      .insert({ list_id: listId, contact_id: contactId });

    if (error) {
      console.error('Error adding contact to list:', error);
      return false;
    }

    return true;
  }

  async removeContactFromList(listId: string, contactId: string): Promise<boolean> {
    const { error } = await supabase
      .from('list_contacts')
      .delete()
      .eq('list_id', listId)
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error removing contact from list:', error);
      return false;
    }

    return true;
  }

  async getListContacts(listId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('list_contacts')
      .select('contacts(*)')
      .eq('list_id', listId);

    if (error) {
      console.error('Error fetching list contacts:', error);
      return [];
    }

    return (data || []).map((item: any) => item.contacts);
  }

  async createCampaign(userId: string, campaign: Campaign): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...campaign, user_id: userId })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating campaign:', error);
      return null;
    }

    return data;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return data || [];
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating campaign:', error);
      return null;
    }

    return data;
  }

  async createSend(send: Send): Promise<Send | null> {
    const { data, error } = await supabase
      .from('sends')
      .insert(send)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating send:', error);
      return null;
    }

    return data;
  }

  async updateSend(id: string, updates: Partial<Send>): Promise<Send | null> {
    const { data, error } = await supabase
      .from('sends')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating send:', error);
      return null;
    }

    return data;
  }

  async getCampaignSends(campaignId: string): Promise<Send[]> {
    const { data, error } = await supabase
      .from('sends')
      .select('*, contacts(*)')
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Error fetching sends:', error);
      return [];
    }

    return data || [];
  }

  async trackEvent(sendId: string, eventType: string, metadata?: Record<string, any>): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .insert({
        send_id: sendId,
        event_type: eventType,
        metadata: metadata || {},
      });

    if (error) {
      console.error('Error tracking event:', error);
      return false;
    }

    return true;
  }

  async getCampaignStats(campaignId: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  }> {
    const sends = await this.getCampaignSends(campaignId);

    const stats = {
      total: sends.length,
      sent: sends.filter(s => s.status === 'sent' || s.status === 'delivered').length,
      delivered: sends.filter(s => s.status === 'delivered').length,
      failed: sends.filter(s => s.status === 'failed').length,
      opened: 0,
      clicked: 0,
    };

    const { data: events } = await supabase
      .from('events')
      .select('event_type, send_id')
      .in('send_id', sends.map(s => s.id));

    if (events) {
      const uniqueOpens = new Set(events.filter(e => e.event_type === 'opened').map(e => e.send_id));
      const uniqueClicks = new Set(events.filter(e => e.event_type === 'clicked').map(e => e.send_id));
      stats.opened = uniqueOpens.size;
      stats.clicked = uniqueClicks.size;
    }

    return stats;
  }
}

export const contactService = new ContactService();
