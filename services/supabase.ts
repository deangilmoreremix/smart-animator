import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing',
    env: import.meta.env
  });
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export interface VideoGeneration {
  id?: string;
  user_id: string;
  title: string;
  prompt: string;
  negative_prompt?: string;
  mode: string;
  model: string;
  aspect_ratio: string;
  resolution: string;
  duration: number;
  camera_motion?: string;
  cinematic_style?: string;
  seed?: number;
  enable_person_generation: boolean;
  video_url?: string;
  input_image_url?: string;
  reference_images?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export class DatabaseService {
  async createVideoGeneration(data: Omit<VideoGeneration, 'id' | 'created_at' | 'updated_at'>): Promise<VideoGeneration | null> {
    const { data: generation, error } = await supabase
      .from('video_generations')
      .insert(data)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating video generation:', error);
      return null;
    }

    return generation;
  }

  async updateVideoGeneration(id: string, updates: Partial<VideoGeneration>): Promise<VideoGeneration | null> {
    const { data: generation, error } = await supabase
      .from('video_generations')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating video generation:', error);
      return null;
    }

    return generation;
  }

  async getVideoGenerations(userId: string, limit: number = 50): Promise<VideoGeneration[]> {
    const { data: generations, error } = await supabase
      .from('video_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching video generations:', error);
      return [];
    }

    return generations || [];
  }

  async getVideoGeneration(id: string): Promise<VideoGeneration | null> {
    const { data: generation, error } = await supabase
      .from('video_generations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching video generation:', error);
      return null;
    }

    return generation;
  }

  async deleteVideoGeneration(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('video_generations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting video generation:', error);
      return false;
    }

    return true;
  }
}

export const databaseService = new DatabaseService();
