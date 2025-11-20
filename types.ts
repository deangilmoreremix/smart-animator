export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}

export interface GenerationConfig {
  prompt: string;
  imageBase64: string; // Pure base64 without data prefix
  mimeType: string;
  aspectRatio: AspectRatio;
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