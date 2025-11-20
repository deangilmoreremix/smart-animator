export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
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

export interface ImageInput {
  imageBytes: string;
  mimeType: string;
}

export interface ReferenceImage extends ImageInput {
  id: string;
}

export interface GenerationConfig {
  mode: GenerationMode;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
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