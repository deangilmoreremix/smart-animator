import { supabase } from './supabase';

export interface PersonalizationContext {
  firstName?: string;
  lastName?: string;
  company?: string;
  industry?: string;
  email?: string;
  customFields?: Record<string, any>;
}

export interface GenerateOptions {
  model?: string;
  ollamaHost?: string;
}

class AIService {
  private ollamaHost: string = 'http://localhost:11434';
  private defaultModel: string = 'llama3.1';

  setOllamaHost(host: string) {
    this.ollamaHost = host;
  }

  setDefaultModel(model: string) {
    this.defaultModel = model;
  }

  async generateEmailSubject(
    context: PersonalizationContext,
    topic: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'email_subject',
          context,
          topic,
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else if (data.fallback) {
        return `${context.firstName ? context.firstName + ', ' : ''}${topic}`;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('AI subject generation error:', error);
      return `${context.firstName ? context.firstName + ', ' : ''}${topic}`;
    }
  }

  async generateEmailBody(
    context: PersonalizationContext,
    topic: string,
    videoTitle?: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'email_body',
          context,
          topic,
          videoTitle,
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else if (data.fallback) {
        return `Hi ${context.firstName || 'there'},\n\nI wanted to share this video about ${topic} with you.\n\nBest regards`;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('AI body generation error:', error);
      return `Hi ${context.firstName || 'there'},\n\nI wanted to share this video about ${topic} with you.\n\nBest regards`;
    }
  }

  async generateSocialCaption(
    platform: string,
    videoDescription: string,
    targetAudience?: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'social_caption',
          context: { industry: targetAudience },
          topic: videoDescription,
          platform,
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else {
        return videoDescription;
      }
    } catch (error) {
      console.error('AI caption generation error:', error);
      return videoDescription;
    }
  }

  async generateHashtags(
    topic: string,
    count: number = 7,
    options: GenerateOptions = {}
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'hashtags',
          context: {},
          topic,
          count,
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      if (error) throw error;

      if (data.success && Array.isArray(data.result)) {
        return data.result;
      } else {
        return [`#${topic.replace(/\s+/g, '')}`];
      }
    } catch (error) {
      console.error('AI hashtag generation error:', error);
      return [`#${topic.replace(/\s+/g, '')}`];
    }
  }

  async generateSMSMessage(
    context: PersonalizationContext,
    topic: string,
    videoUrl: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'sms',
          context,
          topic,
          videoUrl,
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else {
        return `Hi ${context.firstName || 'there'}! Check out this video: ${videoUrl}`;
      }
    } catch (error) {
      console.error('AI SMS generation error:', error);
      return `Hi ${context.firstName || 'there'}! Check out this video: ${videoUrl}`;
    }
  }

  async generateCallToAction(
    context: string,
    targetAction: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'cta',
          context: {},
          topic: context,
          targetAction,
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else {
        return 'Learn More';
      }
    } catch (error) {
      console.error('AI CTA generation error:', error);
      return 'Learn More';
    }
  }

  personalizeTemplate(template: string, context: PersonalizationContext): string {
    let personalized = template;

    const replacements: Record<string, string> = {
      '{firstName}': context.firstName || '',
      '{lastName}': context.lastName || '',
      '{company}': context.company || '',
      '{industry}': context.industry || '',
      '{email}': context.email || '',
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      personalized = personalized.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    if (context.customFields) {
      for (const [key, value] of Object.entries(context.customFields)) {
        const placeholder = `{${key}}`;
        personalized = personalized.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(value));
      }
    }

    return personalized;
  }

  async checkConnection(options: GenerateOptions = {}): Promise<boolean> {
    try {
      const { data } = await supabase.functions.invoke('ai-personalize', {
        body: {
          type: 'email_subject',
          context: { firstName: 'Test' },
          topic: 'connection test',
          model: options.model || this.defaultModel,
          ollamaHost: options.ollamaHost || this.ollamaHost,
        },
      });

      return data?.success === true;
    } catch (error) {
      return false;
    }
  }

  getStatus(): { host: string; model: string } {
    return {
      host: this.ollamaHost,
      model: this.defaultModel,
    };
  }
}

export const aiService = new AIService();
