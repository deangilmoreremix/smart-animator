import { openaiClient } from './client';
import { supabase } from '../supabase';

export interface PersonalizationContext {
  firstName?: string;
  lastName?: string;
  company?: string;
  industry?: string;
  role?: string;
  painPoint?: string;
  customFields?: Record<string, any>;
}

class OpenAITextService {
  async generateEmailSubject(
    context: PersonalizationContext,
    topic: string,
    userId?: string
  ): Promise<string[]> {
    const prompt = `Generate 5 compelling email subject lines for ${context.firstName || 'a recipient'} about ${topic}.

Context:
${context.company ? `- Company: ${context.company}` : ''}
${context.role ? `- Role: ${context.role}` : ''}
${context.industry ? `- Industry: ${context.industry}` : ''}
${context.painPoint ? `- Pain Point: ${context.painPoint}` : ''}

Requirements:
- Maximum 60 characters each
- Personal and engaging
- Not salesy or spammy
- Make it feel genuine
- Use power words and curiosity
- Include benefit or value proposition

Return ONLY the 5 subject lines, one per line, no numbering.`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 200,
      userId,
      operationType: 'email_subject_generation'
    });

    return response.split('\n').filter(line => line.trim()).slice(0, 5);
  }

  async generateEmailBody(
    context: PersonalizationContext,
    topic: string,
    videoUrl: string,
    userId?: string
  ): Promise<string> {
    const prompt = `Write a personalized email body for ${context.firstName || 'a recipient'} introducing a video about ${topic}.

Context:
${context.company ? `- Company: ${context.company}` : ''}
${context.role ? `- Role: ${context.role}` : ''}
${context.industry ? `- Industry: ${context.industry}` : ''}
${context.painPoint ? `- Challenge: ${context.painPoint}` : ''}

Requirements:
- 3-4 sentences maximum
- Warm and friendly tone
- Feel genuine, not automated
- Make it relevant to their business/interests
- Explain why you created this specifically for them
- Create curiosity without overselling
- Include natural transition to video

Write only the email body text:`;

    return openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 300,
      userId,
      operationType: 'email_body_generation'
    });
  }

  async generateVideoScript(
    topic: string,
    targetAudience: string,
    duration: number,
    userId?: string
  ): Promise<string> {
    const prompt = `Create a ${duration}-second video script about ${topic} for ${targetAudience}.

Requirements:
- Natural, conversational tone
- Clear value proposition
- Engaging opening hook
- Logical flow
- Strong call-to-action
- Include timing markers [0:00], [0:05], etc.
- Suitable for text-to-video AI generation

Format as a professional video script:`;

    return openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 800,
      userId,
      operationType: 'video_script_generation'
    });
  }

  async improveScript(
    originalScript: string,
    improvementFocus: string,
    userId?: string
  ): Promise<string> {
    const prompt = `Improve this video script focusing on: ${improvementFocus}

Original Script:
${originalScript}

Provide an improved version that maintains the core message but enhances ${improvementFocus}. Return only the improved script:`;

    return openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.6,
      maxTokens: 1000,
      userId,
      operationType: 'script_improvement'
    });
  }

  async generatePersonalizedCTA(
    context: PersonalizationContext,
    goal: string,
    userId?: string
  ): Promise<string[]> {
    const prompt = `Create 3 compelling call-to-action phrases for ${context.firstName || 'a recipient'} to achieve: ${goal}

Context:
${context.company ? `- Company: ${context.company}` : ''}
${context.role ? `- Role: ${context.role}` : ''}
${context.painPoint ? `- Pain Point: ${context.painPoint}` : ''}

Requirements:
- Maximum 5 words each
- Action-oriented
- Addresses their specific need
- Creates urgency or value
- Not generic

Return only the 3 CTAs, one per line:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 100,
      userId,
      operationType: 'cta_generation'
    });

    return response.split('\n').filter(line => line.trim()).slice(0, 3);
  }

  async generateSocialCaption(
    platform: string,
    videoDescription: string,
    targetAudience?: string,
    userId?: string
  ): Promise<string> {
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
- Use emojis where suitable

Caption:`;

    return openaiClient.completion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 200,
      userId,
      operationType: 'social_caption_generation'
    });
  }

  async generateHashtags(
    topic: string,
    count: number = 7,
    userId?: string
  ): Promise<string[]> {
    const prompt = `Generate ${count} relevant and trending hashtags for content about: ${topic}

Requirements:
- Mix of popular (100K+ posts) and niche (under 50K posts) hashtags
- Relevant to the topic
- No spaces in hashtags
- Return only the hashtags with # symbol, one per line

Hashtags:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 150,
      userId,
      operationType: 'hashtag_generation'
    });

    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('#'))
      .slice(0, count);
  }

  async analyzeSentiment(text: string, userId?: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    emotions: string[];
  }> {
    const prompt = `Analyze the sentiment and emotions in this text:

"${text}"

Return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: number from -1 (very negative) to 1 (very positive)
- emotions: array of detected emotions (e.g., ["excited", "curious", "concerned"])

Return only valid JSON:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 150,
      userId,
      operationType: 'sentiment_analysis'
    });

    return JSON.parse(response);
  }

  async optimizeForSEO(
    title: string,
    description: string,
    keywords: string[],
    userId?: string
  ): Promise<{
    optimizedTitle: string;
    optimizedDescription: string;
    suggestedKeywords: string[];
  }> {
    const prompt = `Optimize this video metadata for SEO:

Title: ${title}
Description: ${description}
Target Keywords: ${keywords.join(', ')}

Requirements:
- Title under 60 characters
- Description under 160 characters
- Include keywords naturally
- Compelling and click-worthy
- SEO best practices

Return a JSON object with: optimizedTitle, optimizedDescription, suggestedKeywords (array)

Return only valid JSON:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 300,
      userId,
      operationType: 'seo_optimization'
    });

    return JSON.parse(response);
  }

  async generateCompanyResearch(
    companyName: string,
    industry: string,
    userId?: string
  ): Promise<{
    insights: string[];
    talkingPoints: string[];
    personalizationSuggestions: string[];
  }> {
    const prompt = `Generate personalized research insights for ${companyName} in the ${industry} industry.

Create:
1. 3 relevant industry trends or challenges they likely face
2. 3 talking points that show you've researched them
3. 3 personalization suggestions for outreach

Return a JSON object with: insights (array), talkingPoints (array), personalizationSuggestions (array)

Return only valid JSON:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500,
      userId,
      operationType: 'company_research'
    });

    return JSON.parse(response);
  }

  async generateABTestVariants(
    originalText: string,
    variantCount: number = 3,
    userId?: string
  ): Promise<string[]> {
    const prompt = `Create ${variantCount} A/B test variants of this text:

Original: "${originalText}"

Requirements:
- Maintain core message
- Vary tone, structure, or emphasis
- Each variant should be distinctly different
- Same approximate length

Return only the ${variantCount} variants, one per line:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.9,
      maxTokens: 400,
      userId,
      operationType: 'ab_test_generation'
    });

    return response.split('\n').filter(line => line.trim()).slice(0, variantCount);
  }

  async scoreContent(
    content: string,
    criteria: string,
    userId?: string
  ): Promise<{
    score: number;
    feedback: string;
    improvements: string[];
  }> {
    const prompt = `Score this content based on: ${criteria}

Content: "${content}"

Provide:
- score: number from 0-100
- feedback: brief explanation
- improvements: array of 3 specific suggestions

Return a JSON object with: score, feedback, improvements (array)

Return only valid JSON:`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 300,
      userId,
      operationType: 'content_scoring'
    });

    return JSON.parse(response);
  }
}

export const openaiTextService = new OpenAITextService();
