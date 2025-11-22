import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PersonalizationContext {
  firstName?: string;
  lastName?: string;
  company?: string;
  industry?: string;
  email?: string;
  customFields?: Record<string, any>;
}

interface AIRequest {
  type: 'email_subject' | 'email_body' | 'social_caption' | 'hashtags' | 'sms' | 'cta';
  context: PersonalizationContext;
  topic?: string;
  videoTitle?: string;
  platform?: string;
  targetAction?: string;
  videoUrl?: string;
  count?: number;
  ollamaHost?: string;
  model?: string;
}

async function callOllama(prompt: string, model: string = 'llama3.1', host: string = 'http://localhost:11434'): Promise<string> {
  try {
    const response = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Ollama API error:', error);
    throw error;
  }
}

function generateEmailSubjectPrompt(context: PersonalizationContext, topic: string): string {
  return `Write a compelling email subject line for ${context.firstName || 'a recipient'} about ${topic}.
${context.company ? `They work at ${context.company}` : ''}
${context.industry ? `in the ${context.industry} industry` : ''}

Requirements:
- Maximum 60 characters
- Personal and engaging
- Not salesy or spammy
- Make it feel genuine

Subject line:`;
}

function generateEmailBodyPrompt(context: PersonalizationContext, topic: string, videoTitle?: string): string {
  return `Write a brief, personal email intro (2-3 sentences) for ${context.firstName || 'a recipient'} introducing a video about ${topic}.
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
}

function generateSocialCaptionPrompt(platform: string, videoDescription: string, targetAudience?: string): string {
  const platformGuidance: Record<string, string> = {
    instagram: 'Include 5-7 relevant hashtags. Engaging and visual. Max 150 words.',
    facebook: 'Conversational and community-focused. Max 100 words.',
    twitter: 'Concise and punchy. Max 280 characters including hashtags.',
    linkedin: 'Professional and value-focused. Max 150 words.',
    tiktok: 'Casual Gen-Z tone. Short and catchy. Max 50 words.',
  };

  const guidance = platformGuidance[platform.toLowerCase()] || 'Engaging and appropriate for the platform.';

  return `Create an engaging ${platform} caption for a video about: ${videoDescription}
${targetAudience ? `Target audience: ${targetAudience}` : ''}

Requirements:
- ${guidance}
- Authentic and engaging
- Include call-to-action
- Platform-appropriate tone

Caption:`;
}

function generateHashtagsPrompt(topic: string, count: number): string {
  return `Generate ${count} relevant and trending hashtags for content about: ${topic}

Requirements:
- Mix of popular (100K+ posts) and niche (under 50K posts) hashtags
- Relevant to the topic
- No spaces in hashtags
- Return only the hashtags, one per line, with # symbol

Hashtags:`;
}

function generateSMSPrompt(context: PersonalizationContext, topic: string): string {
  return `Write a brief SMS message (max 160 characters) for ${context.firstName || 'a recipient'} about ${topic}.
${context.company ? `They work at ${context.company}` : ''}

Requirements:
- Maximum 160 characters total
- Include the text "VIDEO_URL" as placeholder for the video link
- Friendly and personal tone
- Not spammy

SMS message:`;
}

function generateCTAPrompt(context: string, targetAction: string): string {
  return `Generate a compelling call-to-action button text for: ${context}
Target action: ${targetAction}

Requirements:
- Maximum 4 words
- Action-oriented and compelling
- Not generic (avoid "Click Here")
- Create urgency or value

CTA text:`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      type,
      context,
      topic,
      videoTitle,
      platform,
      targetAction,
      videoUrl,
      count = 7,
      ollamaHost = 'http://localhost:11434',
      model = 'llama3.1',
    }: AIRequest = await req.json();

    if (!type || !context) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: type, context' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let prompt = '';
    let result = '';

    switch (type) {
      case 'email_subject':
        if (!topic) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing topic for email_subject' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        prompt = generateEmailSubjectPrompt(context, topic);
        result = await callOllama(prompt, model, ollamaHost);
        result = result.replace(/^["']|["']$/g, '');
        break;

      case 'email_body':
        if (!topic) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing topic for email_body' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        prompt = generateEmailBodyPrompt(context, topic, videoTitle);
        result = await callOllama(prompt, model, ollamaHost);
        break;

      case 'social_caption':
        if (!platform || !topic) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing platform or topic for social_caption' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        prompt = generateSocialCaptionPrompt(platform, topic, context.industry);
        result = await callOllama(prompt, model, ollamaHost);
        break;

      case 'hashtags':
        if (!topic) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing topic for hashtags' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        prompt = generateHashtagsPrompt(topic, count);
        const hashtagsResult = await callOllama(prompt, model, ollamaHost);
        const hashtags = hashtagsResult
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('#'))
          .slice(0, count);
        return new Response(
          JSON.stringify({ success: true, result: hashtags }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'sms':
        if (!topic || !videoUrl) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing topic or videoUrl for sms' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        prompt = generateSMSPrompt(context, topic);
        result = await callOllama(prompt, model, ollamaHost);
        result = result.replace('VIDEO_URL', videoUrl);
        if (result.length > 160) {
          result = result.substring(0, 157) + '...';
        }
        break;

      case 'cta':
        if (!topic || !targetAction) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing topic or targetAction for cta' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        prompt = generateCTAPrompt(topic, targetAction);
        result = await callOllama(prompt, model, ollamaHost);
        result = result.replace(/^["']|["']$/g, '');
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('AI personalization error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate personalized content',
        fallback: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});