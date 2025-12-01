import { openaiTextService } from './openai/textService';
import { openaiVisionService } from './openai/visionService';
import { personalizationEngine } from './personalizationEngine';

export type AIProvider = 'openai' | 'gemini';
export type AITask =
  | 'email_subject'
  | 'email_body'
  | 'video_script'
  | 'social_caption'
  | 'cta'
  | 'video_quality_analysis'
  | 'prospect_research'
  | 'content_optimization';

interface TaskRouting {
  preferredProvider: AIProvider;
  fallbackProvider?: AIProvider;
  reason: string;
}

class AIOrchestrator {
  private routingRules: Record<AITask, TaskRouting> = {
    email_subject: {
      preferredProvider: 'openai',
      fallbackProvider: 'gemini',
      reason: 'OpenAI GPT-4o provides superior creative text generation'
    },
    email_body: {
      preferredProvider: 'openai',
      fallbackProvider: 'gemini',
      reason: 'OpenAI excels at persuasive copywriting'
    },
    video_script: {
      preferredProvider: 'openai',
      fallbackProvider: 'gemini',
      reason: 'OpenAI better understands narrative structure'
    },
    social_caption: {
      preferredProvider: 'openai',
      fallbackProvider: 'gemini',
      reason: 'OpenAI understands platform-specific tone better'
    },
    cta: {
      preferredProvider: 'openai',
      fallbackProvider: 'gemini',
      reason: 'OpenAI generates more compelling action-oriented copy'
    },
    video_quality_analysis: {
      preferredProvider: 'openai',
      reason: 'GPT-4o Vision required for image analysis'
    },
    prospect_research: {
      preferredProvider: 'openai',
      reason: 'GPT-4o has better reasoning for complex research tasks'
    },
    content_optimization: {
      preferredProvider: 'openai',
      fallbackProvider: 'gemini',
      reason: 'OpenAI provides more actionable optimization suggestions'
    }
  };

  getProvider(task: AITask): AIProvider {
    return this.routingRules[task].preferredProvider;
  }

  async generateEmailSubject(
    context: any,
    topic: string,
    userId?: string
  ): Promise<string[]> {
    const provider = this.getProvider('email_subject');

    try {
      if (provider === 'openai') {
        return await openaiTextService.generateEmailSubject(context, topic, userId);
      } else {
        const result = await personalizationEngine.generatePersonalizedSubject(context, topic);
        return result.data.subjects;
      }
    } catch (error) {
      console.error(`Error with ${provider}, trying fallback:`, error);
      const fallback = this.routingRules.email_subject.fallbackProvider;

      if (fallback === 'gemini') {
        const result = await personalizationEngine.generatePersonalizedSubject(context, topic);
        return result.data.subjects;
      }

      throw error;
    }
  }

  async generateEmailBody(
    context: any,
    topic: string,
    videoUrl: string,
    userId?: string
  ): Promise<string> {
    const provider = this.getProvider('email_body');

    try {
      if (provider === 'openai') {
        return await openaiTextService.generateEmailBody(context, topic, videoUrl, userId);
      } else {
        const result = await personalizationEngine.generateEmailBody(context, videoUrl, topic);
        return result.data.emailBody;
      }
    } catch (error) {
      console.error(`Error with ${provider}, trying fallback:`, error);
      const fallback = this.routingRules.email_body.fallbackProvider;

      if (fallback === 'gemini') {
        const result = await personalizationEngine.generateEmailBody(context, videoUrl, topic);
        return result.data.emailBody;
      }

      throw error;
    }
  }

  async generateVideoScript(
    topic: string,
    targetAudience: string,
    duration: number,
    userId?: string
  ): Promise<string> {
    const provider = this.getProvider('video_script');

    if (provider === 'openai') {
      return await openaiTextService.generateVideoScript(topic, targetAudience, duration, userId);
    }

    const prompt = `Create a ${duration}-second video script about ${topic} for ${targetAudience}.`;
    const result = await personalizationEngine.generateRoleBasedMessaging(
      { firstName: targetAudience },
      prompt
    );
    return result.data.adaptedScript;
  }

  async analyzeVideoQuality(
    imageData: string,
    videoGenerationId: string,
    userId: string
  ): Promise<any> {
    return await openaiVisionService.scoreVideoQuality(imageData, videoGenerationId, userId);
  }

  async generateCTA(
    context: any,
    goal: string,
    userId?: string
  ): Promise<string[]> {
    const provider = this.getProvider('cta');

    try {
      if (provider === 'openai') {
        return await openaiTextService.generatePersonalizedCTA(context, goal, userId);
      } else {
        const result = await personalizationEngine.generatePersonalizedCTA(context, goal);
        return [result.data.text];
      }
    } catch (error) {
      console.error(`Error with ${provider}, trying fallback:`, error);
      const fallback = this.routingRules.cta.fallbackProvider;

      if (fallback === 'gemini') {
        const result = await personalizationEngine.generatePersonalizedCTA(context, goal);
        return [result.data.text];
      }

      throw error;
    }
  }

  async getUsageStats(userId: string, days: number = 30): Promise<{
    totalCost: number;
    requestsByProvider: Record<AIProvider, number>;
    costByProvider: Record<AIProvider, number>;
    topOperations: Array<{ operation: string; count: number; cost: number }>;
  }> {
    const { supabase } = await import('./supabase');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('model_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString());

    if (error || !data) {
      return {
        totalCost: 0,
        requestsByProvider: { openai: 0, gemini: 0 },
        costByProvider: { openai: 0, gemini: 0 },
        topOperations: []
      };
    }

    const totalCost = data.reduce((sum, record) => sum + (record.cost_usd || 0), 0);

    const requestsByProvider: Record<string, number> = {};
    const costByProvider: Record<string, number> = {};
    const operationStats: Record<string, { count: number; cost: number }> = {};

    data.forEach(record => {
      const provider = record.provider;
      requestsByProvider[provider] = (requestsByProvider[provider] || 0) + 1;
      costByProvider[provider] = (costByProvider[provider] || 0) + (record.cost_usd || 0);

      const op = record.operation_type;
      if (!operationStats[op]) {
        operationStats[op] = { count: 0, cost: 0 };
      }
      operationStats[op].count++;
      operationStats[op].cost += record.cost_usd || 0;
    });

    const topOperations = Object.entries(operationStats)
      .map(([operation, stats]) => ({ operation, ...stats }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    return {
      totalCost,
      requestsByProvider: {
        openai: requestsByProvider.openai || 0,
        gemini: requestsByProvider.gemini || 0
      },
      costByProvider: {
        openai: costByProvider.openai || 0,
        gemini: costByProvider.gemini || 0
      },
      topOperations
    };
  }

  getRoutingRules(): Record<AITask, TaskRouting> {
    return { ...this.routingRules };
  }
}

export const aiOrchestrator = new AIOrchestrator();
