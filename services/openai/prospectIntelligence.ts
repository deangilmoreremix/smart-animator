import { openaiClient } from './client';
import { supabase } from '../supabase';

export interface ProspectData {
  contactId: string;
  firstName: string;
  lastName?: string;
  company?: string;
  industry?: string;
  role?: string;
  email?: string;
}

export interface IntelligenceReport {
  companyInfo: {
    description: string;
    size: string;
    funding: string;
    techStack: string[];
  };
  recentNews: Array<{
    title: string;
    summary: string;
    date: string;
    relevance: string;
  }>;
  socialActivity: {
    linkedinActivity: string;
    recentPosts: string[];
    engagementTopics: string[];
  };
  triggerEvents: Array<{
    event: string;
    date: string;
    opportunity: string;
  }>;
  personalizationSuggestions: Array<{
    type: string;
    suggestion: string;
    confidence: number;
  }>;
}

class ProspectIntelligenceService {
  async researchProspect(
    prospect: ProspectData,
    userId: string
  ): Promise<IntelligenceReport> {
    const prompt = `Generate comprehensive prospect research for:

Name: ${prospect.firstName} ${prospect.lastName || ''}
${prospect.company ? `Company: ${prospect.company}` : ''}
${prospect.role ? `Role: ${prospect.role}` : ''}
${prospect.industry ? `Industry: ${prospect.industry}` : ''}

Research and provide:

1. Company Information:
   - Brief description
   - Company size (estimate)
   - Funding status (if known)
   - Likely tech stack

2. Recent News (3 most relevant):
   - Title, summary, approximate date, relevance to outreach

3. Social Activity:
   - LinkedIn activity level
   - Recent post topics
   - Engagement topics

4. Trigger Events (2-3):
   - Events that create outreach opportunities
   - Dates
   - How to leverage each opportunity

5. Personalization Suggestions (3-5):
   - Type (pain point, value prop, ice breaker, etc)
   - Specific suggestion
   - Confidence score (0-1)

Return ONLY valid JSON matching this structure:
{
  "companyInfo": {...},
  "recentNews": [...],
  "socialActivity": {...},
  "triggerEvents": [...],
  "personalizationSuggestions": [...]
}`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.6,
      maxTokens: 2000,
      userId,
      operationType: 'prospect_research'
    });

    const intelligence: IntelligenceReport = JSON.parse(response);

    await this.saveIntelligence(prospect.contactId, userId, intelligence);

    return intelligence;
  }

  private async saveIntelligence(
    contactId: string,
    userId: string,
    intelligence: IntelligenceReport
  ): Promise<void> {
    const confidenceScore = intelligence.personalizationSuggestions.reduce(
      (sum, s) => sum + s.confidence,
      0
    ) / intelligence.personalizationSuggestions.length;

    await supabase.from('prospect_intelligence').insert({
      contact_id: contactId,
      user_id: userId,
      company_info: intelligence.companyInfo,
      recent_news: intelligence.recentNews,
      social_activity: intelligence.socialActivity,
      funding_info: {},
      trigger_events: intelligence.triggerEvents,
      personalization_suggestions: intelligence.personalizationSuggestions,
      research_date: new Date().toISOString(),
      confidence_score: confidenceScore
    });
  }

  async getIntelligence(contactId: string, userId: string): Promise<IntelligenceReport | null> {
    const { data, error } = await supabase
      .from('prospect_intelligence')
      .select('*')
      .eq('contact_id', contactId)
      .eq('user_id', userId)
      .order('research_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      companyInfo: data.company_info,
      recentNews: data.recent_news,
      socialActivity: data.social_activity,
      triggerEvents: data.trigger_events,
      personalizationSuggestions: data.personalization_suggestions
    };
  }

  async refreshIfStale(
    prospect: ProspectData,
    userId: string,
    maxAgeHours: number = 168
  ): Promise<IntelligenceReport> {
    const existing = await supabase
      .from('prospect_intelligence')
      .select('*')
      .eq('contact_id', prospect.contactId)
      .eq('user_id', userId)
      .order('research_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing.data) {
      const ageHours = (Date.now() - new Date(existing.data.research_date).getTime()) / (1000 * 60 * 60);
      if (ageHours < maxAgeHours) {
        return {
          companyInfo: existing.data.company_info,
          recentNews: existing.data.recent_news,
          socialActivity: existing.data.social_activity,
          triggerEvents: existing.data.trigger_events,
          personalizationSuggestions: existing.data.personalization_suggestions
        };
      }
    }

    return this.researchProspect(prospect, userId);
  }

  async generateOutreachStrategy(
    prospect: ProspectData,
    intelligence: IntelligenceReport,
    goal: string,
    userId: string
  ): Promise<{
    approach: string;
    talkingPoints: string[];
    emailDraft: string;
    videoConcept: string;
  }> {
    const prompt = `Based on this prospect research, create a personalized outreach strategy:

Prospect: ${prospect.firstName} ${prospect.lastName || ''} at ${prospect.company || 'Unknown Company'}
Role: ${prospect.role || 'Unknown'}

Intelligence:
- Company: ${intelligence.companyInfo.description}
- Recent News: ${intelligence.recentNews.map(n => n.title).join(', ')}
- Trigger Events: ${intelligence.triggerEvents.map(e => e.event).join(', ')}

Goal: ${goal}

Create:
1. Overall approach strategy
2. Key talking points (array of 3-4)
3. Email draft
4. Video concept (what the personalized video should include)

Return ONLY valid JSON with: approach, talkingPoints (array), emailDraft, videoConcept`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1200,
      userId,
      operationType: 'outreach_strategy'
    });

    return JSON.parse(response);
  }

  async detectTriggerEvents(
    companyName: string,
    industry: string,
    userId: string
  ): Promise<Array<{
    event: string;
    date: string;
    source: string;
    urgency: 'high' | 'medium' | 'low';
    outreachAngle: string;
  }>> {
    const prompt = `Identify trigger events for ${companyName} in the ${industry} industry that create outreach opportunities.

Look for:
- Funding announcements
- New hire announcements (especially executives)
- Product launches
- Expansion news
- Awards or recognition
- Industry trends affecting them

For each event, provide:
- event: description
- date: approximate date (or "recent")
- source: where this info typically comes from
- urgency: "high", "medium", or "low"
- outreachAngle: how to use this in personalized outreach

Return JSON array of 2-4 most relevant trigger events.`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.6,
      maxTokens: 800,
      userId,
      operationType: 'trigger_event_detection'
    });

    return JSON.parse(response);
  }

  async scoreLeadQuality(
    prospect: ProspectData,
    intelligence: IntelligenceReport,
    userId: string
  ): Promise<{
    score: number;
    tier: 'A' | 'B' | 'C' | 'D';
    factors: Array<{
      factor: string;
      impact: number;
      reasoning: string;
    }>;
    recommendation: string;
  }> {
    const prompt = `Score this lead's quality and potential:

Prospect: ${prospect.firstName} ${prospect.lastName || ''}
Company: ${prospect.company || 'Unknown'}
Role: ${prospect.role || 'Unknown'}
Industry: ${prospect.industry || 'Unknown'}

Intelligence Summary:
- Company Size: ${intelligence.companyInfo.size}
- Funding: ${intelligence.companyInfo.funding}
- Recent Activity: ${intelligence.triggerEvents.length} trigger events found
- Personalization Opportunities: ${intelligence.personalizationSuggestions.length}

Evaluate based on:
- Company fit and potential
- Decision-making authority
- Timing (trigger events)
- Engagement likelihood

Provide:
- score: 0-100 overall lead quality
- tier: "A" (hot), "B" (warm), "C" (cold), or "D" (poor fit)
- factors: array of 3-4 scoring factors with impact (-10 to +10) and reasoning
- recommendation: specific next steps

Return ONLY valid JSON.`;

    const response = await openaiClient.completion(prompt, {
      model: 'gpt-4o',
      temperature: 0.4,
      maxTokens: 600,
      userId,
      operationType: 'lead_scoring'
    });

    return JSON.parse(response);
  }

  async batchResearch(
    prospects: ProspectData[],
    userId: string,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{
    prospect: ProspectData;
    intelligence: IntelligenceReport;
    error?: string;
  }>> {
    const results: Array<any> = [];

    for (let i = 0; i < prospects.length; i++) {
      try {
        const intelligence = await this.researchProspect(prospects[i], userId);
        results.push({ prospect: prospects[i], intelligence });
      } catch (error: any) {
        results.push({
          prospect: prospects[i],
          intelligence: null,
          error: error.message
        });
      }

      if (onProgress) {
        onProgress(i + 1, prospects.length);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

export const prospectIntelligenceService = new ProspectIntelligenceService();
