import { openaiClient } from './client';
import { supabase } from '../supabase';

export interface VideoQualityScore {
  overall: number;
  composition: number;
  lighting: number;
  clarity: number;
  engagement: number;
  accessibility: number;
  recommendations: string[];
}

export interface ThumbnailAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  bestFor: string[];
}

class OpenAIVisionService {
  async analyzeVideoFrame(
    imageData: string,
    userId?: string
  ): Promise<{
    description: string;
    objects: string[];
    colors: string[];
    mood: string;
  }> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this video frame and provide: 1) A detailed description, 2) Main objects/subjects, 3) Dominant colors, 4) Overall mood/tone. Return as JSON with keys: description, objects (array), colors (array), mood.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 500,
      userId,
      operationType: 'video_frame_analysis'
    });

    return JSON.parse(response);
  }

  async scoreVideoQuality(
    imageData: string,
    videoGenerationId: string,
    userId: string
  ): Promise<VideoQualityScore> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this video frame for quality. Score each category from 0-100:

1. Composition: Rule of thirds, framing, balance
2. Lighting: Exposure, shadows, highlights
3. Clarity: Sharpness, focus, resolution
4. Engagement: Visual interest, subject appeal
5. Accessibility: Contrast, readability, color

Also provide 3-5 specific recommendations for improvement.

Return JSON with: overall (average score), composition, lighting, clarity, engagement, accessibility, recommendations (array).`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 600,
      userId,
      operationType: 'video_quality_scoring'
    });

    const scores: VideoQualityScore = JSON.parse(response);

    await supabase.from('video_quality_scores').insert({
      video_generation_id: videoGenerationId,
      user_id: userId,
      overall_score: scores.overall,
      composition_score: scores.composition,
      lighting_score: scores.lighting,
      clarity_score: scores.clarity,
      engagement_score: scores.engagement,
      accessibility_score: scores.accessibility,
      recommendations: scores.recommendations,
      analyzed_by_model: 'gpt-4o'
    });

    return scores;
  }

  async analyzeThumbnail(
    imageData: string,
    context: string,
    userId?: string
  ): Promise<ThumbnailAnalysis> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this video thumbnail for: ${context}

Evaluate:
- Visual impact and attention-grabbing ability
- Clarity of subject/message
- Color psychology and contrast
- Text readability (if present)
- Emotional appeal
- Click-worthiness

Provide:
- score: 0-100 overall effectiveness
- strengths: array of 2-3 strong points
- weaknesses: array of 2-3 weak points
- suggestions: array of 3-4 improvement ideas
- bestFor: array of platforms/contexts where this thumbnail would work best

Return only valid JSON.`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 600,
      userId,
      operationType: 'thumbnail_analysis'
    });

    return JSON.parse(response);
  }

  async generateVeoPrompt(
    imageData: string,
    additionalContext: string = '',
    userId?: string
  ): Promise<{
    prompt: string;
    negativePrompt: string;
    suggestedSettings: {
      cameraMotion?: string;
      cinematicStyle?: string;
      duration?: number;
    };
  }> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this image and generate an optimal Veo video generation prompt.
${additionalContext ? `\nContext: ${additionalContext}` : ''}

Create:
1. A detailed, descriptive prompt for Veo (focus on motion, action, atmosphere)
2. A negative prompt (what to avoid)
3. Suggested settings (camera motion, cinematic style, duration in seconds)

Return JSON with: prompt, negativePrompt, suggestedSettings (object with optional: cameraMotion, cinematicStyle, duration)`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500,
      userId,
      operationType: 'veo_prompt_generation'
    });

    return JSON.parse(response);
  }

  async detectBrandElements(
    imageData: string,
    brandGuidelines: {
      colors?: string[];
      fonts?: string[];
      logoDescription?: string;
    },
    userId?: string
  ): Promise<{
    compliant: boolean;
    detectedColors: string[];
    issues: string[];
    suggestions: string[];
  }> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Check this image for brand compliance.

Brand Guidelines:
${brandGuidelines.colors ? `- Approved Colors: ${brandGuidelines.colors.join(', ')}` : ''}
${brandGuidelines.fonts ? `- Approved Fonts: ${brandGuidelines.fonts.join(', ')}` : ''}
${brandGuidelines.logoDescription ? `- Logo: ${brandGuidelines.logoDescription}` : ''}

Analyze:
- Color usage vs guidelines
- Visual consistency
- Brand element presence
- Professional quality

Return JSON with: compliant (boolean), detectedColors (array), issues (array), suggestions (array)`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 500,
      userId,
      operationType: 'brand_compliance_check'
    });

    return JSON.parse(response);
  }

  async suggestBRoll(
    scriptText: string,
    userId?: string
  ): Promise<Array<{
    timestamp: string;
    description: string;
    visualPrompt: string;
    importance: 'high' | 'medium' | 'low';
  }>> {
    const prompt = `Analyze this video script and suggest B-roll footage opportunities:

"${scriptText}"

For each B-roll suggestion, provide:
- timestamp: where in script it should appear (e.g., "0:15-0:20")
- description: what the B-roll should show
- visualPrompt: detailed Veo generation prompt for the B-roll
- importance: "high", "medium", or "low"

Return JSON array of suggestions.`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.6,
      maxTokens: 800,
      userId,
      operationType: 'broll_suggestion'
    });

    return JSON.parse(response);
  }

  async analyzeAccessibility(
    imageData: string,
    userId?: string
  ): Promise<{
    score: number;
    colorContrast: {
      sufficient: boolean;
      ratio: string;
      issues: string[];
    };
    textReadability: {
      score: number;
      issues: string[];
    };
    recommendations: string[];
  }> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Evaluate this image for accessibility (WCAG 2.1 standards):

Check:
- Color contrast (text vs background should be at least 4.5:1)
- Text readability
- Visual clarity for color-blind users
- Screen reader compatibility considerations

Provide:
- score: 0-100 overall accessibility
- colorContrast: object with sufficient (boolean), ratio (string), issues (array)
- textReadability: object with score (0-100), issues (array)
- recommendations: array of 3-5 improvements

Return only valid JSON.`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 600,
      userId,
      operationType: 'accessibility_analysis'
    });

    return JSON.parse(response);
  }

  async compareThumbnails(
    thumbnails: string[],
    context: string,
    userId?: string
  ): Promise<{
    rankings: Array<{
      index: number;
      score: number;
      reasoning: string;
    }>;
    recommendation: number;
  }> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Compare these ${thumbnails.length} video thumbnails for: ${context}

Rank them by effectiveness and provide:
- rankings: array of objects with index (0-based), score (0-100), reasoning
- recommendation: index of the best thumbnail

Return only valid JSON.`
          },
          ...thumbnails.map(url => ({
            type: 'image_url',
            image_url: { url }
          }))
        ]
      }
    ];

    const response = await openaiClient.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.4,
      maxTokens: 800,
      userId,
      operationType: 'thumbnail_comparison'
    });

    return JSON.parse(response);
  }
}

export const openaiVisionService = new OpenAIVisionService();
