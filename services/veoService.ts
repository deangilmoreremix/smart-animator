import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationConfig, GenerationMode } from "../types";

export class VeoService {
  private ai: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    let apiKey = localStorage.getItem('VITE_API_KEY') || import.meta.env.VITE_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      throw new Error("API Key not found. Please enter your API Key first.");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  public async generateVideo(config: GenerationConfig): Promise<string> {
    const ai = this.getClient();
    const {
      mode,
      prompt,
      negativePrompt,
      aspectRatio,
      resolution,
      numberOfVideos,
      image,
      referenceImages,
      videoBase64,
      videoMimeType,
      cameraMotion,
      cinematicStyle
    } = config;

    console.log("Starting Video Generation...", {
      mode,
      aspectRatio,
      resolution,
      promptLength: prompt.length,
      hasReferenceImages: !!referenceImages?.length,
      hasNegativePrompt: !!negativePrompt
    });

    try {
      let fullPrompt = prompt;

      if (cameraMotion) {
        fullPrompt += ` Camera motion: ${cameraMotion}.`;
      }

      if (cinematicStyle) {
        fullPrompt += ` Cinematic style: ${cinematicStyle}.`;
      }

      if (negativePrompt) {
        fullPrompt += ` Avoid: ${negativePrompt}.`;
      }

      const requestParams: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: {
          numberOfVideos: numberOfVideos,
          resolution: resolution,
          aspectRatio: aspectRatio as any,
        }
      };

      if (mode === GenerationMode.IMAGE_TO_VIDEO && image) {
        requestParams.image = {
          imageBytes: image.imageBytes,
          mimeType: image.mimeType,
        };
      }

      if (referenceImages && referenceImages.length > 0) {
        requestParams.referenceImages = referenceImages.map(ref => ({
          imageBytes: ref.imageBytes,
          mimeType: ref.mimeType,
        }));
      }

      if (mode === GenerationMode.VIDEO_EXTENSION && videoBase64 && videoMimeType) {
        requestParams.video = {
          videoBytes: videoBase64,
          mimeType: videoMimeType,
        };
      }

      let operation = await ai.models.generateVideos(requestParams);

      console.log("Operation initiated. ID:", operation.name);

      while (!operation.done) {
        console.log("Polling for status...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      console.log("Generation complete. Result:", operation.response);

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

      if (!videoUri) {
        throw new Error("No video URI returned in the response.");
      }

      const apiKey = localStorage.getItem('VITE_API_KEY') || import.meta.env.VITE_API_KEY;
      const authenticatedUrl = `${videoUri}&key=${apiKey}`;

      const response = await fetch(authenticatedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      return objectUrl;

    } catch (error: any) {
      console.error("Veo Service Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
         throw new Error("API Key invalid or session expired. Please select your API Key again.");
      }
      throw error;
    }
  }
}

export const veoService = new VeoService();