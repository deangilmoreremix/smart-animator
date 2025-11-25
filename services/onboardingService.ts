import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_skipped: boolean;
  quick_start_completed: boolean;
  first_video_created: boolean;
  first_campaign_sent: boolean;
  help_drawer_opened: number;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  achievement: string;
  completed_at: string;
  metadata: any;
}

class OnboardingService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async createOrGetProfile(userId: string): Promise<UserProfile | null> {
    try {
      let profile = await this.getUserProfile(userId);

      if (!profile) {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({ user_id: userId })
          .select()
          .single();

        if (error) throw error;
        profile = data;
      }

      return profile;
    } catch (error) {
      console.error('Error creating/getting profile:', error);
      return null;
    }
  }

  async updateOnboardingProgress(
    userId: string,
    updates: Partial<{
      onboarding_step: number;
      onboarding_completed: boolean;
      onboarding_skipped: boolean;
      quick_start_completed: boolean;
      first_video_created: boolean;
      first_campaign_sent: boolean;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      return false;
    }
  }

  async completeOnboarding(userId: string): Promise<boolean> {
    return this.updateOnboardingProgress(userId, {
      onboarding_completed: true,
      onboarding_step: 100
    });
  }

  async skipOnboarding(userId: string): Promise<boolean> {
    return this.updateOnboardingProgress(userId, {
      onboarding_skipped: true,
      onboarding_completed: true
    });
  }

  async incrementHelpDrawerOpened(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return false;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          help_drawer_opened: (profile.help_drawer_opened || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing help drawer count:', error);
      return false;
    }
  }

  async recordAchievement(
    userId: string,
    achievement: string,
    metadata: any = {}
  ): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement', achievement)
        .maybeSingle();

      if (existing) {
        return true;
      }

      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          achievement,
          metadata
        });

      if (error) throw error;

      const achievementMap: Record<string, keyof UserProfile> = {
        'first_video': 'first_video_created',
        'first_campaign': 'first_campaign_sent'
      };

      const profileField = achievementMap[achievement];
      if (profileField) {
        await this.updateOnboardingProgress(userId, {
          [profileField]: true
        } as any);
      }

      return true;
    } catch (error) {
      console.error('Error recording achievement:', error);
      return false;
    }
  }

  async getAchievements(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  async hasCompletedAchievement(userId: string, achievement: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement', achievement)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  }

  async shouldShowWelcome(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return !profile || (!profile.onboarding_completed && !profile.onboarding_skipped);
  }

  async shouldShowQuickStart(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile?.onboarding_completed === true && !profile.quick_start_completed;
  }
}

export const onboardingService = new OnboardingService();
