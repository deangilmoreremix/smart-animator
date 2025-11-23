export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  SQUARE = '1:1',
  ULTRAWIDE = '21:9',
  CINEMA = '2.39:1'
}

export enum Resolution {
  HD = '720p',
  FULL_HD = '1080p'
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'text-to-video',
  IMAGE_TO_VIDEO = 'image-to-video',
  VIDEO_EXTENSION = 'video-extension'
}

export enum VideoDuration {
  SHORT = 4,
  MEDIUM = 6,
  LONG = 8
}

export enum VeoModel {
  VEO_3_1_PREVIEW = 'veo-3.1-generate-preview',
  VEO_3_1_FAST = 'veo-3.1-fast-generate-preview',
  VEO_3_PREVIEW = 'veo-3-generate-preview',
  VEO_3_FAST = 'veo-3-fast-generate-preview',
  VEO_2 = 'veo-002'
}

export enum ReferenceImageType {
  ASSET = 'asset',
  STYLE = 'style',
  CONTENT = 'content'
}

export interface ImageInput {
  imageBytes: string;
  mimeType: string;
}

export interface ReferenceImage extends ImageInput {
  id: string;
  type?: ReferenceImageType;
}

export interface GenerationConfig {
  mode: GenerationMode;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: VideoDuration;
  model: VeoModel;
  numberOfVideos: number;

  // Image-to-video specific
  image?: ImageInput;

  // Reference images for style consistency
  referenceImages?: ReferenceImage[];

  // Video extension specific
  videoBase64?: string;
  videoMimeType?: string;

  // Advanced controls
  cameraMotion?: string;
  cinematicStyle?: string;
  seed?: number;
  enablePersonGeneration?: boolean;
}

export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Type definition for the AI Studio window extension
declare global {
  interface Window {
    aistudio: AIStudio;
  }

  // Removed process declaration to fix "Cannot redeclare block-scoped variable 'process'" error.
  // We assume process is available in the environment.
}

export interface VideoGenerationResult {
  videoUrl: string; // Blob URL
  expiryTime?: number;
}

export type UserRole = 'user' | 'admin' | 'superadmin';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'trial';

export type AuditAction = 'role_update' | 'user_delete';

export interface UserWithRole {
  user_id: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  suspension_reason?: string;
  suspension_until?: string;
  last_login_at?: string;
  last_login_ip?: string;
  notes?: string;
}

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

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  changed_by: string;
  changed_by_email: string;
  action: AuditAction;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  created_by: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_roles: UserRole[];
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
}

export type PersonalizationTier = 'basic' | 'smart' | 'advanced';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
export type RecipientStatus = 'pending' | 'processing' | 'ready' | 'sent' | 'failed' | 'viewed';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  video_id?: string;
  master_video_id?: string;
  template_script?: string;
  personalization_tier?: PersonalizationTier;
  personalization_fields?: string[];
  visual_style?: Record<string, any>;
  subject?: string;
  message_template?: string;
  channels?: string[];
  status?: CampaignStatus;
  processing_status?: string;
  total_recipients?: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  contact_id?: string;
  email: string;
  first_name: string;
  last_name?: string;
  company?: string;
  role?: string;
  industry?: string;
  pain_point?: string;
  custom_fields?: Record<string, any>;
  personalized_video_url?: string;
  thumbnail_url?: string;
  status: RecipientStatus;
  generation_cost?: number;
  processing_time_ms?: number;
  error_message?: string;
  sent_at?: string;
  viewed_at?: string;
  view_count: number;
  watch_duration_seconds?: number;
  created_at: string;
  updated_at?: string;
}

export interface PersonalizationAsset {
  id: string;
  recipient_id: string;
  asset_type: 'intro' | 'overlay' | 'cta' | 'broll' | 'caption' | 'thumbnail' | 'background';
  asset_url?: string;
  asset_data?: Record<string, any>;
  gemini_prompt_used: string;
  generation_time_ms: number;
  cost?: number;
  created_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  total_recipients: number;
  videos_generated: number;
  videos_sent: number;
  total_views: number;
  unique_views: number;
  avg_watch_time_seconds?: number;
  completion_rate?: number;
  response_rate?: number;
  total_cost: number;
  avg_generation_time_ms?: number;
  created_at: string;
  updated_at?: string;
}

export interface PersonalizationTemplate {
  id: string;
  user_id: string;
  template_name: string;
  description?: string;
  use_case: 'cold_outreach' | 'abm' | 'onboarding' | 'follow_up' | 'nurture';
  personalization_tier: PersonalizationTier;
  default_fields: string[];
  script_template: string;
  visual_style?: Record<string, any>;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at?: string;
}