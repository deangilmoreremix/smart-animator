# OpenAI Integration Features

This document describes all the OpenAI-powered AI features integrated into Smart Animator.

## Overview

Smart Animator now uses **OpenAI** (GPT-4o, GPT-4o-mini, Whisper, TTS) alongside **Google Gemini** (Veo, Gemini 2.0 Flash) to provide best-in-class AI capabilities:

- **OpenAI**: Superior text generation, voice processing, and vision analysis
- **Gemini**: Video generation and visual content creation
- **AI Orchestrator**: Intelligently routes tasks to the optimal provider

## Environment Setup

Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

The key is automatically available in:
- Netlify Functions
- Supabase Edge Functions

## Core Infrastructure

### Database Tables

All AI features are backed by Supabase with proper RLS security:

- **ai_conversations** - Realtime API conversation sessions
- **voice_recordings** - Audio recordings and transcripts
- **ai_insights** - AI-generated recommendations
- **model_usage_tracking** - API usage and cost tracking
- **ai_learning_data** - System improvement data
- **video_quality_scores** - AI video quality assessments
- **prospect_intelligence** - Researched prospect data

### Service Layer

#### OpenAI Client (`services/openai/client.ts`)
- Unified API interface
- Automatic cost tracking
- Usage analytics
- Error handling with fallbacks

#### Text Service (`services/openai/textService.ts`)
- Email subject generation (5 variants)
- Email body generation
- Video script creation
- CTA generation
- Social media captions
- Hashtag generation
- Sentiment analysis
- SEO optimization
- Company research
- A/B test variants
- Content scoring

#### Vision Service (`services/openai/visionService.ts`)
- Video frame analysis
- Quality scoring (composition, lighting, clarity, engagement, accessibility)
- Thumbnail analysis and comparison
- Veo prompt generation from images
- Brand compliance checking
- B-roll suggestion generation
- Accessibility auditing

#### Realtime Service (`services/openai/realtimeService.ts`)
- WebSocket connection management
- Voice recording and transcription
- Real-time conversation handling
- Session persistence
- Message buffering

#### Prospect Intelligence (`services/openai/prospectIntelligence.ts`)
- Automated prospect research
- Company intelligence gathering
- Trigger event detection
- Lead quality scoring
- Outreach strategy generation
- Batch research processing

#### AI Orchestrator (`services/aiOrchestrator.ts`)
- Intelligent task routing between OpenAI and Gemini
- Cost optimization
- Automatic fallback handling
- Usage analytics
- Performance tracking

## Features by Category

### 1. Voice-to-Video Creation

**Components**: `VoiceRecorder.tsx`

**Features**:
- Record voice input for video scripts
- Real-time or batch transcription
- Whisper-powered accuracy
- Auto-saves recordings to Supabase
- Supports pause/resume

**Usage**:
```tsx
<VoiceRecorder
  onTranscript={(text) => console.log(text)}
  onRecordingComplete={(blob, transcript, duration) => {}}
  mode="realtime" // or "simple"
  conversationType="video_creation"
/>
```

### 2. AI Video Script Assistant

**Features**:
- Conversational script development
- Real-time feedback on quality
- Interactive improvement suggestions
- Voice-controlled editing
- Timing and pacing analysis

**Usage**:
```typescript
import { openaiTextService } from './services/openai/textService';

const script = await openaiTextService.generateVideoScript(
  'Product demo',
  'B2B SaaS executives',
  30, // duration in seconds
  userId
);
```

### 3. Advanced Personalization with GPT-4o

**Features**:
- 5 email subject variants per contact
- Personalized email bodies
- Custom CTAs based on pain points
- Industry-specific messaging
- Role-based content adaptation

**Usage**:
```typescript
import { aiOrchestrator } from './services/aiOrchestrator';

const subjects = await aiOrchestrator.generateEmailSubject(
  { firstName: 'John', company: 'Acme', role: 'VP Sales' },
  'Schedule a demo',
  userId
);
```

### 4. Video Quality Enhancement

**Components**: `VideoQualityAnalyzer` (implementation ready)

**Features**:
- AI-powered quality scoring
- Composition analysis
- Lighting assessment
- Clarity evaluation
- Engagement prediction
- Accessibility compliance
- Actionable recommendations

**Usage**:
```typescript
import { openaiVisionService } from './services/openai/visionService';

const scores = await openaiVisionService.scoreVideoQuality(
  imageDataUrl,
  videoGenerationId,
  userId
);

console.log(scores.overall); // 0-100 score
console.log(scores.recommendations); // Array of improvements
```

### 5. Prospect Intelligence System

**Components**: `ProspectIntelligence.tsx`

**Features**:
- Automated company research
- Recent news monitoring
- Social activity analysis
- Trigger event detection
- Personalization suggestions
- Lead quality scoring

**Usage**:
```tsx
<ProspectIntelligence
  prospect={{
    contactId: '123',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp',
    industry: 'SaaS',
    role: 'VP Sales',
    email: 'john@acme.com'
  }}
  onClose={() => {}}
/>
```

### 6. AI Insights Dashboard

**Components**: `AIInsightsDashboard.tsx`

**Features**:
- Automated optimization suggestions
- Opportunity detection
- Performance warnings
- Confidence scoring
- Impact assessment
- One-click application

**Usage**:
```tsx
<AIInsightsDashboard />
```

Insights are automatically generated based on:
- Campaign performance
- Video engagement
- Contact interactions
- Usage patterns

### 7. Enhanced Campaign Wizard

**Components**: `AIEnhancedCampaignWizard.tsx`

**Features**:
- Voice-enabled campaign setup
- Automatic prospect research
- Personalized content generation
- Intelligence-driven messaging
- Multi-variant testing
- Progress tracking

**Usage**:
```tsx
<AIEnhancedCampaignWizard
  videoUrl="https://example.com/video.mp4"
  onComplete={(campaign) => console.log(campaign)}
  onCancel={() => {}}
/>
```

## API Endpoints

### Netlify Function: `openai-proxy`

**Purpose**: Secure proxy for OpenAI API calls

**Endpoints**:
- `chat` - Chat completions
- `embeddings` - Text embeddings
- `audio/speech` - Text-to-speech
- `audio/transcriptions` - Speech-to-text
- `images/generations` - Image generation

**Usage**:
```typescript
const response = await fetch('/.netlify/functions/openai-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'chat',
    data: {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }]
    }
  })
});
```

### Supabase Edge Function: `realtime-voice`

**Purpose**: Handle real-time voice processing

**Actions**:
- `connect` - Get WebSocket URL for Realtime API
- `transcribe` - Transcribe audio with Whisper
- `generate_speech` - Convert text to speech

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('realtime-voice', {
  body: {
    action: 'transcribe',
    audioData: arrayBuffer
  }
});
```

## Cost Management

### Usage Tracking

All API calls are automatically tracked in `model_usage_tracking`:

```sql
SELECT
  provider,
  model,
  operation_type,
  SUM(total_tokens) as total_tokens,
  SUM(cost_usd) as total_cost
FROM model_usage_tracking
WHERE user_id = 'user-uuid'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY provider, model, operation_type;
```

### Cost Analysis

```typescript
import { aiOrchestrator } from './services/aiOrchestrator';

const stats = await aiOrchestrator.getUsageStats(userId, 30);

console.log(stats.totalCost); // Total cost in USD
console.log(stats.costByProvider); // { openai: 12.50, gemini: 8.30 }
console.log(stats.topOperations); // Most expensive operations
```

### Cost Optimization

The AI Orchestrator automatically:
- Uses GPT-4o-mini for simple tasks (90% cheaper than GPT-4o)
- Routes to Gemini when appropriate
- Caches repeated queries
- Batches similar requests
- Provides real-time cost alerts

**Typical Costs**:
- Email subject generation: $0.001 per contact
- Video quality analysis: $0.005 per video
- Prospect research: $0.02 per contact
- Voice transcription: $0.006 per minute

## Model Selection Guide

### When to Use GPT-4o
- Complex reasoning tasks
- Creative writing
- Strategic analysis
- Company research
- Content optimization

### When to Use GPT-4o-mini
- Simple text generation
- Repetitive tasks
- High-volume operations
- Basic analysis
- Quick responses

### When to Use Gemini
- Video generation
- Visual content creation
- Image analysis
- Cost-sensitive operations

### When to Use Whisper
- Voice transcription
- All audio-to-text needs
- Multi-language support

## Advanced Features

### 1. Sentiment Analysis

```typescript
const analysis = await openaiTextService.analyzeSentiment(
  "I'm excited about this opportunity!",
  userId
);

// Returns: {
//   sentiment: 'positive',
//   score: 0.85,
//   emotions: ['excited', 'optimistic']
// }
```

### 2. SEO Optimization

```typescript
const seo = await openaiTextService.optimizeForSEO(
  'My Video Title',
  'Video description',
  ['keyword1', 'keyword2'],
  userId
);

// Returns optimized title, description, and keyword suggestions
```

### 3. A/B Test Generation

```typescript
const variants = await openaiTextService.generateABTestVariants(
  'Original subject line',
  5,
  userId
);

// Returns 5 different variants to test
```

### 4. Content Scoring

```typescript
const score = await openaiTextService.scoreContent(
  'Your email content',
  'clarity, engagement, professionalism',
  userId
);

// Returns: {
//   score: 85,
//   feedback: 'Strong opening but...',
//   improvements: ['Add specific data', 'Shorter sentences', ...]
// }
```

### 5. Thumbnail Comparison

```typescript
const comparison = await openaiVisionService.compareThumbnails(
  [thumbnail1Url, thumbnail2Url, thumbnail3Url],
  'YouTube video thumbnail',
  userId
);

// Returns rankings with scores and reasoning
```

### 6. Accessibility Analysis

```typescript
const accessibility = await openaiVisionService.analyzeAccessibility(
  imageDataUrl,
  userId
);

// Returns: {
//   score: 92,
//   colorContrast: { sufficient: true, ratio: '7.2:1', issues: [] },
//   textReadability: { score: 95, issues: [] },
//   recommendations: [...]
// }
```

## Integration Examples

### Example 1: Complete Campaign Flow

```typescript
// 1. Research prospects
const intelligence = await prospectIntelligenceService.researchProspect(
  prospect,
  userId
);

// 2. Generate personalized content
const subjects = await aiOrchestrator.generateEmailSubject(
  { ...prospect, painPoint: intelligence.personalizationSuggestions[0].suggestion },
  'Schedule a demo',
  userId
);

const body = await aiOrchestrator.generateEmailBody(
  prospect,
  'Schedule a demo',
  videoUrl,
  userId
);

const ctas = await aiOrchestrator.generateCTA(
  prospect,
  'Schedule a demo',
  userId
);

// 3. Analyze video quality
const quality = await openaiVisionService.scoreVideoQuality(
  videoFrameUrl,
  videoId,
  userId
);

// 4. Send personalized campaign
// ... send logic
```

### Example 2: Voice-Driven Video Creation

```typescript
// 1. Start voice recording
const sessionId = await openaiRealtimeService.startSession(
  userId,
  'video_creation'
);

// 2. Connect WebSocket
await openaiRealtimeService.connectWebSocket(sessionId);

// 3. Process voice input (happens automatically)
// User speaks: "Create a product demo video for enterprise customers..."

// 4. Get transcript and generate video
const messages = openaiRealtimeService.getMessages();
const transcript = messages[messages.length - 1].content;

const script = await openaiTextService.generateVideoScript(
  transcript,
  'enterprise customers',
  30,
  userId
);

// 5. Generate video with Veo
// ... video generation logic
```

## Monitoring & Analytics

### Real-Time Metrics

Monitor AI performance in real-time:

```typescript
// Get usage stats
const stats = await aiOrchestrator.getUsageStats(userId, 7);

console.log(`Total cost: $${stats.totalCost.toFixed(2)}`);
console.log(`OpenAI requests: ${stats.requestsByProvider.openai}`);
console.log(`Gemini requests: ${stats.requestsByProvider.gemini}`);
```

### Performance Tracking

All operations track:
- Latency (milliseconds)
- Token usage (input/output)
- Cost (USD)
- Success rate
- Error messages

### Insights Generation

AI automatically generates insights from:
- Usage patterns
- Performance metrics
- Error rates
- User behavior
- Campaign results

## Security & Privacy

### Data Protection
- All API keys stored in environment variables
- No keys in client-side code
- Supabase RLS enforces data isolation
- Encrypted in transit and at rest

### PII Handling
- No customer data sent to OpenAI without consent
- Voice recordings stored in private Supabase storage
- Transcripts encrypted in database
- Automatic data retention policies

### Access Control
- JWT-based authentication
- Row-level security on all tables
- Function-level permissions
- Audit logging enabled

## Troubleshooting

### Common Issues

**API Key Not Working**:
```bash
# Check environment variable
echo $OPENAI_API_KEY

# Restart Netlify Dev
npm run dev
```

**Voice Recording Fails**:
- Check microphone permissions
- Ensure HTTPS (required for getUserMedia)
- Verify browser compatibility

**High Costs**:
- Review usage with `aiOrchestrator.getUsageStats()`
- Switch expensive operations to GPT-4o-mini
- Implement request caching
- Set usage limits per user

**Slow Performance**:
- Use streaming responses for long content
- Batch similar requests
- Implement request queuing
- Use lower latency models

## Future Enhancements

Planned features:
- [ ] Multi-language support for all text operations
- [ ] Video editing via voice commands
- [ ] Automated video thumbnail generation
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom model fine-tuning
- [ ] Webhook integrations
- [ ] Mobile app support

## Support

For issues or questions:
1. Check this documentation
2. Review API usage and costs
3. Check Supabase logs for errors
4. Review OpenAI API status

## Cost Examples

Based on typical usage:

**Solo Entrepreneur (10 campaigns/month)**:
- 50 contacts researched: $1.00
- 500 emails personalized: $0.50
- 50 videos analyzed: $0.25
- 10 hours voice transcription: $3.60
- **Total: ~$5.35/month**

**Small Agency (100 campaigns/month)**:
- 500 contacts researched: $10.00
- 5,000 emails personalized: $5.00
- 500 videos analyzed: $2.50
- 50 hours voice transcription: $18.00
- **Total: ~$35.50/month**

**Enterprise (1000 campaigns/month)**:
- 5,000 contacts researched: $100.00
- 50,000 emails personalized: $50.00
- 5,000 videos analyzed: $25.00
- 200 hours voice transcription: $72.00
- **Total: ~$247/month**

---

**Note**: Replace `your_openai_api_key_here` in `.env` with your actual OpenAI API key to activate all features.
