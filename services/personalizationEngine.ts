import { supabase } from './supabase';
import { CampaignRecipient } from '../types';
import { safeJsonParse, safeFetch } from './apiUtils';

export interface PersonalizationContext {
  firstName?: string;
  lastName?: string;
  company?: string;
  industry?: string;
  role?: string;
  painPoint?: string;
  customFields?: Record<string, any>;
}

export interface GeneratedAsset {
  type: 'intro' | 'overlay' | 'cta' | 'broll' | 'caption' | 'thumbnail' | 'background';
  url?: string;
  data?: Record<string, any>;
  prompt: string;
  generationTime: number;
  cost?: number;
}

class PersonalizationEngine {
  private readonly GEMINI_ENDPOINT = '/.netlify/functions/gemini-generate';

  private async callGemini(endpoint: string, method: string = 'POST', body?: any): Promise<any> {
    try {
      const response = await safeFetch(this.GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, method, body })
      });

      if (!response.ok) {
        let errorMessage = `Gemini API error: ${response.statusText}`;
        try {
          const error = await safeJsonParse(response);
          errorMessage = error.message || error.error || errorMessage;
        } catch (parseError) {
          const text = await response.text();
          errorMessage = `HTTP ${response.status}: ${text.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }

      return await safeJsonParse(response);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  async generateBasicIntro(context: PersonalizationContext): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Create a professional, personalized video intro text for:
Name: ${context.firstName}${context.lastName ? ' ' + context.lastName : ''}
${context.company ? `Company: ${context.company}` : ''}

Generate a warm, engaging intro line (max 15 words) that addresses them by name and mentions their company if provided.
Output ONLY the intro text, no quotes or extra formatting.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const introText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                       `Hi ${context.firstName}${context.company ? ` from ${context.company}` : ''}!`;

      return {
        type: 'intro',
        data: { text: introText },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.001
      };
    } catch (error) {
      console.error('Error generating intro:', error);
      return {
        type: 'intro',
        data: { text: `Hi ${context.firstName}${context.company ? ` from ${context.company}` : ''}!` },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generatePersonalizedSubject(context: PersonalizationContext, topic: string): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Create 3 compelling email subject lines for:
Recipient: ${context.firstName}${context.lastName ? ' ' + context.lastName : ''}
${context.company ? `Company: ${context.company}` : ''}
${context.role ? `Role: ${context.role}` : ''}
Topic: ${topic}

Make them personalized, benefit-focused, and under 60 characters each.
Format: Just the 3 subject lines, one per line, no numbering.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const subjects = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim().split('\n').filter((s: string) => s.trim()) ||
                      [`${context.firstName}, special video for ${context.company || 'you'}`];

      return {
        type: 'caption',
        data: { subjects, selectedSubject: subjects[0] },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.002
      };
    } catch (error) {
      console.error('Error generating subject:', error);
      return {
        type: 'caption',
        data: { subjects: [`${context.firstName}, check this out`], selectedSubject: `${context.firstName}, check this out` },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generatePersonalizedCTA(context: PersonalizationContext, goal: string): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Create a compelling call-to-action button text for:
Recipient: ${context.firstName}
${context.company ? `Company: ${context.company}` : ''}
${context.role ? `Role: ${context.role}` : ''}
${context.painPoint ? `Pain Point: ${context.painPoint}` : ''}
Goal: ${goal}

Generate ONE short, action-oriented CTA (max 5 words) that addresses their specific need.
Output ONLY the CTA text, no quotes or explanations.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const ctaText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                     'Get Started Now';

      return {
        type: 'cta',
        data: { text: ctaText, goal },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.001
      };
    } catch (error) {
      console.error('Error generating CTA:', error);
      return {
        type: 'cta',
        data: { text: 'Learn More', goal },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generateEmailBody(context: PersonalizationContext, videoUrl: string, topic: string): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Write a personalized email body for:
Name: ${context.firstName}${context.lastName ? ' ' + context.lastName : ''}
${context.company ? `Company: ${context.company}` : ''}
${context.role ? `Role: ${context.role}` : ''}
${context.industry ? `Industry: ${context.industry}` : ''}
${context.painPoint ? `Challenge: ${context.painPoint}` : ''}

Topic: ${topic}

Write a brief, friendly email (3-4 sentences) that:
1. Addresses them by name
2. References their company/role naturally
3. Explains why you created this video specifically for them
4. Mentions the video is included

Keep it conversational and genuine. Output only the email body.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const emailBody = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                       `Hi ${context.firstName},\n\nI created this video specifically for ${context.company || 'you'}. I thought you'd find it valuable given your role${context.role ? ` as ${context.role}` : ''}.\n\nCheck it out below!`;

      return {
        type: 'caption',
        data: { emailBody, videoUrl },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.002
      };
    } catch (error) {
      console.error('Error generating email body:', error);
      return {
        type: 'caption',
        data: {
          emailBody: `Hi ${context.firstName},\n\nI made this video for you. Hope you find it helpful!\n\nBest regards`,
          videoUrl
        },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generateIndustryVisuals(context: PersonalizationContext): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Generate a description for industry-specific B-roll visuals for ${context.industry || 'business'} industry.
${context.company ? `Company: ${context.company}` : ''}

Create a detailed visual description (2-3 sentences) of professional imagery that would resonate with this industry.
Examples: SaaS = modern dashboards, FinTech = security shields, Healthcare = caring professionals.
Output ONLY the visual description.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const visualDescription = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                               `Professional ${context.industry || 'business'} imagery`;

      return {
        type: 'broll',
        data: { description: visualDescription, industry: context.industry },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.003
      };
    } catch (error) {
      console.error('Error generating industry visuals:', error);
      return {
        type: 'broll',
        data: { description: `Professional ${context.industry || 'business'} imagery`, industry: context.industry },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generateRoleBasedMessaging(context: PersonalizationContext, baseScript: string): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Adapt this video script for a ${context.role || 'professional'}:

Base Script: ${baseScript}

Recipient Role: ${context.role || 'professional'}
Company: ${context.company || 'their company'}

Rewrite to emphasize benefits most relevant to their role (executives = ROI, technical = features, sales = revenue).
Keep it under 100 words. Output ONLY the adapted script.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const adaptedScript = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || baseScript;

      return {
        type: 'caption',
        data: { adaptedScript, role: context.role, baseScript },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.004
      };
    } catch (error) {
      console.error('Error generating role-based messaging:', error);
      return {
        type: 'caption',
        data: { adaptedScript: baseScript, role: context.role },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generatePainPointCTA(context: PersonalizationContext): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Create a compelling CTA that addresses this specific pain point:
Pain Point: ${context.painPoint || 'business challenges'}
Company: ${context.company || 'their company'}
Role: ${context.role || 'professional'}

Generate ONE specific CTA (max 7 words) that directly addresses solving their pain point.
Output ONLY the CTA text.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const ctaText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                     `Solve ${context.painPoint || 'Your Challenges'}`;

      return {
        type: 'cta',
        data: { text: ctaText, painPoint: context.painPoint },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.002
      };
    } catch (error) {
      console.error('Error generating pain point CTA:', error);
      return {
        type: 'cta',
        data: { text: 'Get Started Today', painPoint: context.painPoint },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generateCompanyResearchInsights(context: PersonalizationContext): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Generate personalized company research insights for:
Company: ${context.company || 'the company'}
Industry: ${context.industry || 'business'}

Create 2-3 sentences showing you've researched them. Include:
1. A relevant industry trend or challenge they likely face
2. How this relates to their specific situation

Make it feel personal and researched, not generic. Output ONLY the insight text.`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const insights = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                      `I noticed ${context.company} operates in the ${context.industry} space, which is experiencing significant transformation. This presents both challenges and opportunities for growth.`;

      return {
        type: 'caption',
        data: { insights, company: context.company },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.005
      };
    } catch (error) {
      console.error('Error generating company insights:', error);
      return {
        type: 'caption',
        data: {
          insights: `I've been following ${context.company}'s work in ${context.industry} and thought this would be relevant.`,
          company: context.company
        },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generateDynamicBackgroundPrompt(context: PersonalizationContext): Promise<GeneratedAsset> {
    const startTime = Date.now();

    const prompt = `Create a Veo video generation prompt for a dynamic background that matches:
Industry: ${context.industry || 'business'}
Company Type: ${context.company || 'professional company'}

Generate a prompt for a 5-second professional background loop (abstract, ambient, no people).
Examples: Tech = flowing data streams, Finance = elegant stock tickers, Healthcare = subtle medical patterns.
Output ONLY the Veo prompt (under 100 words).`;

    try {
      const response = await this.callGemini(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'POST',
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const backgroundPrompt = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                              `Subtle professional background for ${context.industry} industry with ambient motion`;

      return {
        type: 'background',
        data: { veoPrompt: backgroundPrompt, industry: context.industry },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0.003
      };
    } catch (error) {
      console.error('Error generating background prompt:', error);
      return {
        type: 'background',
        data: { veoPrompt: `Professional ${context.industry} background`, industry: context.industry },
        prompt,
        generationTime: Date.now() - startTime,
        cost: 0
      };
    }
  }

  async generateTier1Assets(recipient: CampaignRecipient, goal: string = 'Schedule a call'): Promise<GeneratedAsset[]> {
    const context: PersonalizationContext = {
      firstName: recipient.first_name,
      lastName: recipient.last_name || undefined,
      company: recipient.company || undefined,
      industry: recipient.industry || undefined,
      role: recipient.role || undefined,
      painPoint: recipient.pain_point || undefined,
      customFields: recipient.custom_fields || undefined
    };

    const assets: GeneratedAsset[] = [];

    const intro = await this.generateBasicIntro(context);
    assets.push(intro);

    const subject = await this.generatePersonalizedSubject(context, goal);
    assets.push(subject);

    const cta = await this.generatePersonalizedCTA(context, goal);
    assets.push(cta);

    return assets;
  }

  async generateTier2Assets(recipient: CampaignRecipient, baseScript: string, goal: string = 'Schedule a call'): Promise<GeneratedAsset[]> {
    const context: PersonalizationContext = {
      firstName: recipient.first_name,
      lastName: recipient.last_name || undefined,
      company: recipient.company || undefined,
      industry: recipient.industry || undefined,
      role: recipient.role || undefined,
      painPoint: recipient.pain_point || undefined,
      customFields: recipient.custom_fields || undefined
    };

    const assets: GeneratedAsset[] = [];

    const tier1Assets = await this.generateTier1Assets(recipient, goal);
    assets.push(...tier1Assets);

    if (context.industry) {
      const industryVisuals = await this.generateIndustryVisuals(context);
      assets.push(industryVisuals);
    }

    if (context.role && baseScript) {
      const roleMessaging = await this.generateRoleBasedMessaging(context, baseScript);
      assets.push(roleMessaging);
    }

    if (context.painPoint) {
      const painPointCTA = await this.generatePainPointCTA(context);
      assets.push(painPointCTA);
    }

    return assets;
  }

  async generateTier3Assets(recipient: CampaignRecipient, baseScript: string, goal: string = 'Schedule a call'): Promise<GeneratedAsset[]> {
    const context: PersonalizationContext = {
      firstName: recipient.first_name,
      lastName: recipient.last_name || undefined,
      company: recipient.company || undefined,
      industry: recipient.industry || undefined,
      role: recipient.role || undefined,
      painPoint: recipient.pain_point || undefined,
      customFields: recipient.custom_fields || undefined
    };

    const assets: GeneratedAsset[] = [];

    const tier2Assets = await this.generateTier2Assets(recipient, baseScript, goal);
    assets.push(...tier2Assets);

    if (context.company && context.industry) {
      const companyInsights = await this.generateCompanyResearchInsights(context);
      assets.push(companyInsights);
    }

    if (context.industry) {
      const backgroundPrompt = await this.generateDynamicBackgroundPrompt(context);
      assets.push(backgroundPrompt);
    }

    return assets;
  }

  async saveAssets(recipientId: string, assets: GeneratedAsset[]): Promise<boolean> {
    try {
      const records = assets.map(asset => ({
        recipient_id: recipientId,
        asset_type: asset.type,
        asset_url: asset.url || null,
        asset_data: asset.data || {},
        gemini_prompt_used: asset.prompt,
        generation_time_ms: asset.generationTime,
        cost: asset.cost || 0
      }));

      const { error } = await supabase
        .from('personalization_assets')
        .insert(records);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving assets:', error);
      return false;
    }
  }

  async getAssets(recipientId: string): Promise<GeneratedAsset[]> {
    try {
      const { data, error } = await supabase
        .from('personalization_assets')
        .select('*')
        .eq('recipient_id', recipientId);

      if (error) throw error;

      return (data || []).map(asset => ({
        type: asset.asset_type as any,
        url: asset.asset_url || undefined,
        data: asset.asset_data || {},
        prompt: asset.gemini_prompt_used,
        generationTime: asset.generation_time_ms,
        cost: asset.cost
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  }

  personalizeText(template: string, context: PersonalizationContext): string {
    let personalized = template;

    const replacements: Record<string, string> = {
      '{{firstName}}': context.firstName || '',
      '{{lastName}}': context.lastName || '',
      '{{fullName}}': `${context.firstName || ''} ${context.lastName || ''}`.trim(),
      '{{company}}': context.company || '',
      '{{role}}': context.role || '',
      '{{industry}}': context.industry || '',
      '{{painPoint}}': context.painPoint || ''
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
}

export const personalizationEngine = new PersonalizationEngine();
