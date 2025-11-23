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