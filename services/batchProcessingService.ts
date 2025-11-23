import { campaignService } from './campaignService';
import { personalizationEngine } from './personalizationEngine';
import { CampaignRecipient } from '../types';

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

      const totalCost = assets.reduce((sum, asset) => sum + (asset.cost || 0), 0);
      const processingTime = Date.now() - startTime;

      const mockVideoUrl = `https://placeholder-video.com/${recipient.id}.mp4`;

      await campaignService.updateRecipient(recipient.id, {
        status: 'ready',
        personalized_video_url: mockVideoUrl,
        generation_cost: totalCost,
        processing_time_ms: processingTime
      });

      return {
        recipientId: recipient.id,
        status: 'success',
        videoUrl: mockVideoUrl,
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const batchProcessingService = new BatchProcessingService();
