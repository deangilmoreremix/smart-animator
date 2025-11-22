import { Ollama } from 'ollama';

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
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_MODEL = 'llama3.1';
const OLLAMA_HOST = import.meta.env.VITE_OLLAMA_HOST || 'http://localhost:11434';

class OllamaService {
  private ollama: Ollama;
  private isAvailable: boolean = false;

  constructor() {
    this.ollama = new Ollama({ host: OLLAMA_HOST });
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      await this.ollama.list();
      this.isAvailable = true;
    } catch (error) {
      console.warn('Ollama not available:', error);
      this.isAvailable = false;
    }
  }

  async generateEmailSubject(
    context: PersonalizationContext,
    topic: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      return `${context.firstName ? context.firstName + ', ' : ''}${topic}`;
    }

    const prompt = `Write a compelling email subject line for ${context.firstName || 'a recipient'} about ${topic}.
${context.company ? `They work at ${context.company}` : ''}
${context.industry ? `in the ${context.industry} industry` : ''}

Requirements:
- Maximum 60 characters
- Personal and engaging
- Not salesy or spammy
- Make it feel genuine

Subject line:`;

    try {
      const response = await this.ollama.generate({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
      });

      return response.response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Ollama generation error:', error);
      return `${context.firstName ? context.firstName + ', ' : ''}${topic}`;
    }
  }

  async generateEmailBody(
    context: PersonalizationContext,
    topic: string,
    videoTitle?: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      return `Hi ${context.firstName || 'there'},\n\nI wanted to share this video about ${topic} with you.\n\nBest regards`;
    }

    const prompt = `Write a brief, personal email intro (2-3 sentences) for ${context.firstName || 'a recipient'} introducing a video about ${topic}.
${context.company ? `They work at ${context.company}` : ''}
${context.industry ? `in the ${context.industry} industry` : ''}
${videoTitle ? `The video is titled: "${videoTitle}"` : ''}

Requirements:
- Warm and friendly tone
- Feel genuine, not automated
- Make it relevant to their business/interests
- 2-3 sentences maximum
- Don't use overly salesy language

Email intro:`;

    try {
      const response = await this.ollama.generate({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
      });

      return response.response.trim();
    } catch (error) {
      console.error('Ollama generation error:', error);
      return `Hi ${context.firstName || 'there'},\n\nI wanted to share this video about ${topic} with you.\n\nBest regards`;
    }
  }

  async generateSocialCaption(
    platform: string,
    videoDescription: string,
    targetAudience?: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      return videoDescription;
    }

    const platformGuidance: Record<string, string> = {
      instagram: 'Include 5-7 relevant hashtags. Engaging and visual. Max 150 words.',
      facebook: 'Conversational and community-focused. Max 100 words.',
      twitter: 'Concise and punchy. Max 280 characters including hashtags.',
      linkedin: 'Professional and value-focused. Max 150 words.',
      tiktok: 'Casual Gen-Z tone. Short and catchy. Max 50 words.',
    };

    const guidance = platformGuidance[platform.toLowerCase()] || 'Engaging and appropriate for the platform.';

    const prompt = `Create an engaging ${platform} caption for a video about: ${videoDescription}
${targetAudience ? `Target audience: ${targetAudience}` : ''}

Requirements:
- ${guidance}
- Authentic and engaging
- Include call-to-action
- Platform-appropriate tone

Caption:`;

    try {
      const response = await this.ollama.generate({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
      });

      return response.response.trim();
    } catch (error) {
      console.error('Ollama generation error:', error);
      return videoDescription;
    }
  }

  async generateHashtags(
    topic: string,
    count: number = 7,
    options: GenerateOptions = {}
  ): Promise<string[]> {
    if (!this.isAvailable) {
      return [`#${topic.replace(/\s+/g, '')}`];
    }

    const prompt = `Generate ${count} relevant and trending hashtags for content about: ${topic}

Requirements:
- Mix of popular (100K+ posts) and niche (under 50K posts) hashtags
- Relevant to the topic
- No spaces in hashtags
- Return only the hashtags, one per line, with # symbol

Hashtags:`;

    try {
      const response = await this.ollama.generate({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
      });

      const hashtags = response.response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('#'))
        .slice(0, count);

      return hashtags.length > 0 ? hashtags : [`#${topic.replace(/\s+/g, '')}`];
    } catch (error) {
      console.error('Ollama generation error:', error);
      return [`#${topic.replace(/\s+/g, '')}`];
    }
  }

  async generateSMSMessage(
    context: PersonalizationContext,
    topic: string,
    videoUrl: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      return `Hi ${context.firstName || 'there'}! Check out this video: ${videoUrl}`;
    }

    const prompt = `Write a brief SMS message (max 160 characters) for ${context.firstName || 'a recipient'} about ${topic}.
${context.company ? `They work at ${context.company}` : ''}

Requirements:
- Maximum 160 characters total
- Include the text "VIDEO_URL" as placeholder for the video link
- Friendly and personal tone
- Not spammy

SMS message:`;

    try {
      const response = await this.ollama.generate({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
      });

      let message = response.response.trim();
      message = message.replace('VIDEO_URL', videoUrl);

      if (message.length > 160) {
        message = message.substring(0, 157) + '...';
      }

      return message;
    } catch (error) {
      console.error('Ollama generation error:', error);
      return `Hi ${context.firstName || 'there'}! Check out this video: ${videoUrl}`;
    }
  }

  async generateCallToAction(
    context: string,
    targetAction: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      return `Learn More`;
    }

    const prompt = `Generate a compelling call-to-action button text for: ${context}
Target action: ${targetAction}

Requirements:
- Maximum 4 words
- Action-oriented and compelling
- Not generic (avoid "Click Here")
- Create urgency or value

CTA text:`;

    try {
      const response = await this.ollama.generate({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
      });

      return response.response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Ollama generation error:', error);
      return 'Learn More';
    }
  }

  async personalizeTemplate(
    template: string,
    context: PersonalizationContext
  ): Promise<string> {
    let personalized = template;

    const replacements: Record<string, string> = {
      '{{firstName}}': context.firstName || '',
      '{{lastName}}': context.lastName || '',
      '{{company}}': context.company || '',
      '{{industry}}': context.industry || '',
      '{{email}}': context.email || '',
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      personalized = personalized.replace(new RegExp(placeholder, 'g'), value);
    }

    if (context.customFields) {
      for (const [key, value] of Object.entries(context.customFields)) {
        const placeholder = `{{${key}}}`;
        personalized = personalized.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    return personalized;
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.ollama.list();
      this.isAvailable = true;
      return true;
    } catch (error) {
      this.isAvailable = false;
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.ollama.list();
      return response.models.map(m => m.name);
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  getStatus(): { available: boolean; host: string } {
    return {
      available: this.isAvailable,
      host: OLLAMA_HOST,
    };
  }
}

export const ollamaService = new OllamaService();
