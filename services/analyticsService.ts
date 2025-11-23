import { supabase } from './supabase';

export interface UserAnalytics {
  user_id: string;
  email: string;
  role: string;
  video_count: number;
  contact_count: number;
  campaign_count: number;
  last_login?: string;
  created_at: string;
  total_storage_mb: number;
}

export interface PlatformStats {
  total_users: number;
  total_videos: number;
  total_contacts: number;
  total_campaigns: number;
  active_users_7d: number;
  active_users_30d: number;
  new_users_7d: number;
  new_users_30d: number;
}

export interface VideoStats {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  status: string;
  created_at: string;
  duration: number;
  video_url: string | null;
}

export const analyticsService = {
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      const { count: videoCount } = await supabase
        .from('video_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: campaignCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        user_id: userId,
        email: userData?.user?.email || 'Unknown',
        role: roleData?.role || 'user',
        video_count: videoCount || 0,
        contact_count: contactCount || 0,
        campaign_count: campaignCount || 0,
        last_login: userData?.user?.last_sign_in_at,
        created_at: roleData?.created_at || userData?.user?.created_at || '',
        total_storage_mb: 0,
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  },

  async getAllUsersAnalytics(): Promise<UserAnalytics[]> {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (!roles) return [];

      const analytics = await Promise.all(
        roles.map(async (role) => {
          const stats = await this.getUserAnalytics(role.user_id);
          return stats;
        })
      );

      return analytics.filter((stat): stat is UserAnalytics => stat !== null);
    } catch (error) {
      console.error('Error fetching all users analytics:', error);
      return [];
    }
  },

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { count: totalUsers } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      const { count: totalVideos } = await supabase
        .from('video_generations')
        .select('*', { count: 'exact', head: true });

      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      const { count: totalCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true });

      const { count: newUsers7d } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: newUsers30d } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: activeVideos7d } = await supabase
        .from('video_generations')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: activeVideos30d } = await supabase
        .from('video_generations')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        total_users: totalUsers || 0,
        total_videos: totalVideos || 0,
        total_contacts: totalContacts || 0,
        total_campaigns: totalCampaigns || 0,
        active_users_7d: activeVideos7d || 0,
        active_users_30d: activeVideos30d || 0,
        new_users_7d: newUsers7d || 0,
        new_users_30d: newUsers30d || 0,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        total_users: 0,
        total_videos: 0,
        total_contacts: 0,
        total_campaigns: 0,
        active_users_7d: 0,
        active_users_30d: 0,
        new_users_7d: 0,
        new_users_30d: 0,
      };
    }
  },

  async getAllVideos(limit: number = 50): Promise<VideoStats[]> {
    try {
      const { data: videos } = await supabase
        .from('video_generations')
        .select('id, user_id, title, status, created_at, duration, video_url')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!videos) return [];

      const videosWithEmails = await Promise.all(
        videos.map(async (video) => {
          const { data: userData } = await supabase.auth.admin.getUserById(video.user_id);
          return {
            ...video,
            user_email: userData?.user?.email || 'Unknown',
          };
        })
      );

      return videosWithEmails;
    } catch (error) {
      console.error('Error fetching all videos:', error);
      return [];
    }
  },

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('video_generations')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error('Error deleting video:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      return false;
    }
  },

  async exportUsersToCSV(): Promise<string> {
    try {
      const analytics = await this.getAllUsersAnalytics();

      const headers = [
        'Email',
        'Role',
        'Videos',
        'Contacts',
        'Campaigns',
        'Last Login',
        'Created At',
      ];

      const rows = analytics.map((user) => [
        user.email,
        user.role,
        user.video_count.toString(),
        user.contact_count.toString(),
        user.campaign_count.toString(),
        user.last_login || 'Never',
        new Date(user.created_at).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting users to CSV:', error);
      return '';
    }
  },
};
