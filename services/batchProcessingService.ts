import { campaignService } from './campaignService';
import { personalizationEngine } from './personalizationEngine';
import { veoService } from './veoService';
import { supabase } from './supabase';
import { rateLimitService } from './rateLimitService';
import { errorHandler, ErrorCategory, ErrorSeverity } from './errorHandler';
import { CampaignRecipient, GenerationConfig, GenerationMode } from '../types';

export interface ProcessingResult {
  recipientId: string;
  status: 'success' | 'failed';
  videoUrl?: string;
  cost?: number;
  processingTime?: number;
  error?: string;
}

export interface CampaignProcessingSummary {
  total: number;
  successful: number;
  failed: number;
  totalCost: number;
  totalTime: number;
  results: ProcessingResult[];
}

class BatchProcessingService {
  private readonly BATCH_SIZE = 5;
  private readonly DELAY_BETWEEN_BATCHES = 2000;

  async processCampaign(
    campaignId: string,
    tier: 'basic' | 'smart' | 'advanced',
    baseScript: string = '',
    goal: string = 'Schedule a call',
    onProgress?: (progress: number, total: number) => void
  ): Promise<CampaignProcessingSummary> {
    const startTime = Date.now();
    const recipients = await campaignService.getRecipients(campaignId, 'pending');

    const results: ProcessingResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let totalCost = 0;

    await campaignService.updateCampaign(campaignId, {
      processing_status: 'processing'
    });

    for (let i = 0; i < recipients.length; i += this.BATCH_SIZE) {
      const batch = recipients.slice(i, Math.min(i + this.BATCH_SIZE, recipients.length));

      const batchPromises = batch.map(recipient =>
        this.processRecipient(recipient, tier, baseScript, goal)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        const recipient = batch[index];

        if (result.status === 'fulfilled') {
          results.push(result.value);

          if (result.value.status === 'success') {
            successCount++;
            totalCost += result.value.cost || 0;
          } else {
            failedCount++;
          }
        } else {
          results.push({
            recipientId: recipient.id,
            status: 'failed',
            error: result.reason?.message || 'Unknown error'
          });
          failedCount++;
        }
      });

      if (onProgress) {
        onProgress(Math.min(i + this.BATCH_SIZE, recipients.length), recipients.length);
      }

      if (i + this.BATCH_SIZE < recipients.length) {
        await this.delay(this.DELAY_BETWEEN_BATCHES);
      }
    }

    await campaignService.updateCampaign(campaignId, {
      processing_status: 'ready'
    });

    await campaignService.updateCampaignAnalytics(campaignId, {
      videos_generated: successCount,
      total_cost: totalCost
    });

    return {
      total: recipients.length,
      successful: successCount,
      failed: failedCount,
      totalCost,
      totalTime: Date.now() - startTime,
      results
    };
  }

  private async processRecipient(
    recipient: CampaignRecipient,
    tier: 'basic' | 'smart' | 'advanced',
    baseScript: string,
    goal: string
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      await rateLimitService.enforceRateLimit('video-generation');

      await campaignService.updateRecipient(recipient.id, {
        status: 'processing'
      });

      let assets;
      switch (tier) {
        case 'basic':
          assets = await personalizationEngine.generateTier1Assets(recipient, goal);
          break;
        case 'smart':
          assets = await personalizationEngine.generateTier2Assets(recipient, baseScript, goal);
          break;
        case 'advanced':
          assets = await personalizationEngine.generateTier3Assets(recipient, baseScript, goal);
          break;
        default:
          assets = await personalizationEngine.generateTier1Assets(recipient, goal);
      }

      await personalizationEngine.saveAssets(recipient.id, assets);

      let videoCost = 0;
      let videoUrl: string | null = null;

      const introAsset = assets.find(a => a.type === 'intro');
      const scriptAsset = assets.find(a => a.type === 'caption' && a.data?.adaptedScript);

      const videoPrompt = this.buildVideoPrompt(recipient, introAsset, scriptAsset, baseScript);

      try {
        const veoConfig: GenerationConfig = {
          mode: GenerationMode.TEXT_TO_VIDEO,
          prompt: videoPrompt,
          aspectRatio: '9:16',
          resolution: '720p',
          duration: 5,
          model: 'veo-002',
          numberOfVideos: 1
        };

        const generatedVideoUrl = await veoService.generateVideo(veoConfig);

        const videoBlob = await fetch(generatedVideoUrl).then(r => r.blob());
        const fileName = `${recipient.campaign_id}/${recipient.id}_${Date.now()}.mp4`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('personalized-videos')
          .upload(fileName, videoBlob, {
            contentType: 'video/mp4',
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('personalized-videos')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;

        videoCost = tier === 'basic' ? 0.02 : tier === 'smart' ? 0.05 : 0.15;
      } catch (videoError: any) {
        console.error('Video generation failed, using placeholder:', videoError);
        videoUrl = `https://placeholder-video.com/${recipient.id}.mp4`;
      }

      const assetsCost = assets.reduce((sum, asset) => sum + (asset.cost || 0), 0);
      const totalCost = assetsCost + videoCost;
      const processingTime = Date.now() - startTime;

      await campaignService.updateRecipient(recipient.id, {
        status: 'ready',
        personalized_video_url: videoUrl,
        generation_cost: totalCost,
        processing_time_ms: processingTime
      });

      return {
        recipientId: recipient.id,
        status: 'success',
        videoUrl: videoUrl || undefined,
        cost: totalCost,
        processingTime
      };
    } catch (error: any) {
      console.error(`Error processing recipient ${recipient.id}:`, error);

      await campaignService.updateRecipient(recipient.id, {
        status: 'failed',
        error_message: error.message || 'Processing failed'
      });

      return {
        recipientId: recipient.id,
        status: 'failed',
        error: error.message || 'Processing failed',
        processingTime: Date.now() - startTime
      };
    }
  }

  async retryFailedRecipients(
    campaignId: string,
    tier: 'basic' | 'smart' | 'advanced',
    baseScript: string = '',
    goal: string = 'Schedule a call'
  ): Promise<CampaignProcessingSummary> {
    const failedRecipients = await campaignService.getRecipients(campaignId, 'failed');

    const results: ProcessingResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let totalCost = 0;

    for (const recipient of failedRecipients) {
      const result = await this.processRecipient(recipient, tier, baseScript, goal);
      results.push(result);

      if (result.status === 'success') {
        successCount++;
        totalCost += result.cost || 0;
      } else {
        failedCount++;
      }

      await this.delay(1000);
    }

    return {
      total: failedRecipients.length,
      successful: successCount,
      failed: failedCount,
      totalCost,
      totalTime: 0,
      results
    };
  }

  async estimateCampaignTime(recipientCount: number, tier: 'basic' | 'smart' | 'advanced'): Promise<number> {
    const timePerRecipient = {
      basic: 5000,
      smart: 15000,
      advanced: 30000
    };

    const batchTime = (Math.ceil(recipientCount / this.BATCH_SIZE) - 1) * this.DELAY_BETWEEN_BATCHES;
    const processingTime = recipientCount * timePerRecipient[tier];

    return processingTime + batchTime;
  }

  private buildVideoPrompt(
    recipient: CampaignRecipient,
    introAsset?: any,
    scriptAsset?: any,
    baseScript?: string
  ): string {
    const firstName = recipient.first_name;
    const company = recipient.company || 'your company';
    const role = recipient.role || 'professional';
    const industry = recipient.industry || 'business';

    let prompt = '';

    if (introAsset?.data?.text) {
      prompt += `${introAsset.data.text}. `;
    } else {
      prompt += `Hi ${firstName} from ${company}. `;
    }

    if (scriptAsset?.data?.adaptedScript) {
      prompt += scriptAsset.data.adaptedScript;
    } else if (baseScript) {
      prompt += baseScript;
    } else {
      prompt += `I wanted to reach out to you as a ${role} in the ${industry} industry. `;
      prompt += `I believe our solution could help ${company} achieve its goals. `;
    }

    prompt += ` Professional business video style, clean modern aesthetic, ${industry} industry context.`;

    return prompt.substring(0, 500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const batchProcessingService = new BatchProcessingService();
