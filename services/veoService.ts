import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationConfig } from "../types";

export class VeoService {
  private ai: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found. Please select an API Key first.");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  public async generateVideo(config: GenerationConfig): Promise<string> {
    const ai = this.getClient();
    const { prompt, imageBase64, mimeType, aspectRatio } = config;

    console.log("Starting Video Generation...", { aspectRatio, promptLength: prompt.length });

    try {
      // 1. Initiate Generation
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: imageBase64,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio as any, // Cast if SDK type strictness varies
        }
      });

      console.log("Operation initiated. ID:", operation.name);

      // 2. Poll for Completion
      // The prompt suggests waiting 5 seconds between checks
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

      // 3. Fetch Authenticated Video
      // We must append the API key to the download link manually
      const authenticatedUrl = `${videoUri}&key=${process.env.API_KEY}`;
      
      const response = await fetch(authenticatedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      return objectUrl;

    } catch (error: any) {
      console.error("Veo Service Error:", error);
      // Basic error re-mapping for better UI messages
      if (error.message?.includes("Requested entity was not found")) {
         throw new Error("API Key invalid or session expired. Please select your API Key again.");
      }
      throw error;
    }
  }
}

export const veoService = new VeoService();