import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationConfig, GenerationMode } from "../types";
import { NetlifyClient } from "./netlifyClient";

export class VeoService {
  private ai: GoogleGenerativeAI | null = null;

  private useNetlifyFunctions = import.meta.env.PROD;

  private getClient(): GoogleGenerativeAI {
    if (this.useNetlifyFunctions) {
      throw new Error("Direct client not available in production. Use Netlify Functions.");
    }
    let apiKey = localStorage.getItem('VITE_API_KEY') || import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
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
      duration,
      model,
      numberOfVideos,
      image,
      referenceImages,
      videoBase64,
      videoMimeType,
      cameraMotion,
      cinematicStyle,
      seed,
      enablePersonGeneration
    } = config;

    console.log("Starting Video Generation...", {
      mode,
      model,
      aspectRatio,
      resolution,
      duration,
      promptLength: prompt.length,
      hasReferenceImages: !!referenceImages?.length,
      hasNegativePrompt: !!negativePrompt,
      seed: seed || 'random'
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
        model: model,
        prompt: fullPrompt,
        config: {
          numberOfVideos: numberOfVideos,
          resolution: resolution,
          aspectRatio: aspectRatio as any,
          videoDuration: `${duration}s`,
        }
      };

      if (seed !== undefined) {
        requestParams.config.seed = seed;
      }

      if (enablePersonGeneration !== undefined) {
        requestParams.config.personGeneration = enablePersonGeneration ? 'allow_adult' : 'dont_allow';
      }

      if (mode === GenerationMode.IMAGE_TO_VIDEO && image) {
        requestParams.image = {
          imageBytes: image.imageBytes,
          mimeType: image.mimeType,
        };
      }

      if (referenceImages && referenceImages.length > 0) {
        requestParams.referenceImages = referenceImages.map(ref => {
          const refImg: any = {
            imageBytes: ref.imageBytes,
            mimeType: ref.mimeType,
          };
          if (ref.type) {
            refImg.referenceType = ref.type;
          }
          return refImg;
        });
      }

      if (mode === GenerationMode.VIDEO_EXTENSION && videoBase64 && videoMimeType) {
        requestParams.video = {
          videoBytes: videoBase64,
          mimeType: videoMimeType,
        };
      }

      let operation;

      if (this.useNetlifyFunctions) {
        const generateEndpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateVideos`;
        operation = await NetlifyClient.callGeminiAPI(generateEndpoint, 'POST', requestParams);
      } else {
        operation = await ai.models.generateVideos(requestParams);
      }

      console.log("Operation initiated. ID:", operation.name);

      while (!operation.done) {
        console.log("Polling for status...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        if (this.useNetlifyFunctions) {
          const statusEndpoint = `https://generativelanguage.googleapis.com/v1/${operation.name}`;
          operation = await NetlifyClient.callGeminiAPI(statusEndpoint, 'GET');
        } else {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }
      }

      console.log("Generation complete. Result:", operation.response);

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

      if (!videoUri) {
        throw new Error("No video URI returned in the response.");
      }

      if (this.useNetlifyFunctions) {
        const downloadResponse = await NetlifyClient.callGeminiAPI(videoUri, 'GET');
        const blob = new Blob([downloadResponse], { type: 'video/mp4' });
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
      } else {
        const apiKey = localStorage.getItem('VITE_API_KEY') || import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
        const authenticatedUrl = `${videoUri}&key=${apiKey}`;

        const response = await fetch(authenticatedUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
      }

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