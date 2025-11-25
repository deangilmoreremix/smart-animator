import { supabase } from './supabase';

export interface VideoViewEvent {
  recipientId: string;
  campaignId: string;
  videoUrl: string;
  duration?: number;
  completionPercentage?: number;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    screenResolution?: string;
  };
}

export interface EmailOpenEvent {
  recipientId: string;
  campaignId: string;
  sendId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LinkClickEvent {
  recipientId: string;
  campaignId: string;
  sendId: string;
  linkUrl: string;
  ipAddress?: string;
}

export interface ConversionEvent {
  recipientId: string;
  campaignId: string;
  conversionType: 'signup' | 'purchase' | 'booking' | 'download' | 'custom';
  value?: number;
  metadata?: Record<string, any>;
}

class TrackingService {
  async trackVideoView(event: VideoViewEvent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          send_id: event.recipientId,
          type: 'view',
          metadata: {
            videoUrl: event.videoUrl,
            duration: event.duration,
            completionPercentage: event.completionPercentage,
            deviceInfo: event.deviceInfo
          }
        });

      if (error) throw error;

      await supabase.rpc('increment_campaign_views', {
        campaign_id: event.campaignId,
        unique_view: true
      });

      const recipient = await supabase
        .from('campaign_recipients')
        .select('viewed_at')
        .eq('id', event.recipientId)
        .single();

      if (!recipient.data?.viewed_at) {
        await supabase
          .from('campaign_recipients')
          .update({
            viewed_at: new Date().toISOString(),
            view_count: 1
          })
          .eq('id', event.recipientId);
      } else {
        await supabase
          .from('campaign_recipients')
          .update({
            view_count: supabase.rpc('increment', { x: 1 })
          })
          .eq('id', event.recipientId);
      }

      return true;
    } catch (error) {
      console.error('Error tracking video view:', error);
      return false;
    }
  }

  async trackEmailOpen(event: EmailOpenEvent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          send_id: event.sendId,
          type: 'open',
          metadata: {
            ipAddress: event.ipAddress,
            userAgent: event.userAgent
          }
        });

      if (error) throw error;

      const send = await supabase
        .from('sends')
        .select('opened_at')
        .eq('id', event.sendId)
        .single();

      if (!send.data?.opened_at) {
        await supabase
          .from('sends')
          .update({
            opened_at: new Date().toISOString()
          })
          .eq('id', event.sendId);
      }

      return true;
    } catch (error) {
      console.error('Error tracking email open:', error);
      return false;
    }
  }

  async trackLinkClick(event: LinkClickEvent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          send_id: event.sendId,
          type: 'click',
          metadata: {
            linkUrl: event.linkUrl,
            ipAddress: event.ipAddress
          }
        });

      if (error) throw error;

      const send = await supabase
        .from('sends')
        .select('clicked_at')
        .eq('id', event.sendId)
        .single();

      if (!send.data?.clicked_at) {
        await supabase
          .from('sends')
          .update({
            clicked_at: new Date().toISOString()
          })
          .eq('id', event.sendId);
      }

      return true;
    } catch (error) {
      console.error('Error tracking link click:', error);
      return false;
    }
  }

  async trackConversion(event: ConversionEvent): Promise<boolean> {
    try {
      const { error: eventError } = await supabase
        .from('events')
        .insert({
          send_id: event.recipientId,
          type: 'conversion',
          metadata: {
            conversionType: event.conversionType,
            value: event.value,
            ...event.metadata
          }
        });

      if (eventError) throw eventError;

      await supabase
        .from('campaign_recipients')
        .update({
          converted_at: new Date().toISOString(),
          conversion_type: event.conversionType,
          conversion_value: event.value
        })
        .eq('id', event.recipientId);

      const { error: analyticsError } = await supabase.rpc('increment_campaign_conversions', {
        campaign_id: event.campaignId,
        conversion_value: event.value || 0
      });

      if (analyticsError) throw analyticsError;

      return true;
    } catch (error) {
      console.error('Error tracking conversion:', error);
      return false;
    }
  }

  async getCampaignEngagement(campaignId: string): Promise<{
    totalRecipients: number;
    emailsSent: number;
    emailsOpened: number;
    videosViewed: number;
    linksClicked: number;
    conversions: number;
    openRate: number;
    viewRate: number;
    clickRate: number;
    conversionRate: number;
    avgWatchTime?: number;
  }> {
    try {
      const { data: analytics } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      const { data: recipients } = await supabase
        .from('campaign_recipients')
        .select('viewed_at, converted_at')
        .eq('campaign_id', campaignId);

      const totalRecipients = analytics?.total_recipients || 0;
      const emailsSent = analytics?.videos_sent || 0;
      const videosViewed = recipients?.filter(r => r.viewed_at).length || 0;
      const conversions = recipients?.filter(r => r.converted_at).length || 0;

      const { data: events } = await supabase
        .from('events')
        .select('type')
        .in('send_id', recipients?.map(r => r.id) || []);

      const emailsOpened = events?.filter(e => e.type === 'open').length || 0;
      const linksClicked = events?.filter(e => e.type === 'click').length || 0;

      return {
        totalRecipients,
        emailsSent,
        emailsOpened,
        videosViewed,
        linksClicked,
        conversions,
        openRate: emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0,
        viewRate: emailsSent > 0 ? (videosViewed / emailsSent) * 100 : 0,
        clickRate: emailsOpened > 0 ? (linksClicked / emailsOpened) * 100 : 0,
        conversionRate: videosViewed > 0 ? (conversions / videosViewed) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting campaign engagement:', error);
      return {
        totalRecipients: 0,
        emailsSent: 0,
        emailsOpened: 0,
        videosViewed: 0,
        linksClicked: 0,
        conversions: 0,
        openRate: 0,
        viewRate: 0,
        clickRate: 0,
        conversionRate: 0
      };
    }
  }

  async getRecipientEngagement(recipientId: string): Promise<{
    emailSent: boolean;
    emailOpened: boolean;
    emailOpenedAt?: string;
    videoViewed: boolean;
    videoViewedAt?: string;
    videoViewCount: number;
    linksClicked: number;
    converted: boolean;
    convertedAt?: string;
    conversionValue?: number;
    lastActivity?: string;
  }> {
    try {
      const { data: recipient } = await supabase
        .from('campaign_recipients')
        .select('*')
        .eq('id', recipientId)
        .single();

      const { data: send } = await supabase
        .from('sends')
        .select('sent_at, opened_at, clicked_at')
        .eq('contact_id', recipient?.contact_id)
        .eq('campaign_id', recipient?.campaign_id)
        .single();

      const { data: events } = await supabase
        .from('events')
        .select('type, created_at')
        .eq('send_id', recipientId)
        .order('created_at', { ascending: false });

      const clickEvents = events?.filter(e => e.type === 'click') || [];
      const lastActivity = events?.[0]?.created_at;

      return {
        emailSent: !!send?.sent_at,
        emailOpened: !!send?.opened_at,
        emailOpenedAt: send?.opened_at,
        videoViewed: !!recipient?.viewed_at,
        videoViewedAt: recipient?.viewed_at,
        videoViewCount: recipient?.view_count || 0,
        linksClicked: clickEvents.length,
        converted: !!recipient?.converted_at,
        convertedAt: recipient?.converted_at,
        conversionValue: recipient?.conversion_value,
        lastActivity
      };
    } catch (error) {
      console.error('Error getting recipient engagement:', error);
      return {
        emailSent: false,
        emailOpened: false,
        videoViewed: false,
        videoViewCount: 0,
        linksClicked: 0,
        converted: false
      };
    }
  }

  generateTrackingPixelUrl(recipientId: string, campaignId: string): string {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${baseUrl}/functions/v1/track-open?recipient=${recipientId}&campaign=${campaignId}`;
  }

  generateTrackingLink(originalUrl: string, recipientId: string, campaignId: string, sendId: string): string {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const encoded = encodeURIComponent(originalUrl);
    return `${baseUrl}/functions/v1/track-click?url=${encoded}&recipient=${recipientId}&campaign=${campaignId}&send=${sendId}`;
  }
}

export const trackingService = new TrackingService();
