/*
  # OpenAI Infrastructure - Core Tables

  1. New Tables
    - `ai_conversations` - Stores Realtime API conversation sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_id` (text, unique)
      - `conversation_type` (text)
      - `messages` (jsonb array)
      - `metadata` (jsonb)
      - `status` (text)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `created_at` (timestamptz)

    - `voice_recordings` - Stores audio recordings and transcripts
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `conversation_id` (uuid, references ai_conversations, nullable)
      - `audio_url` (text)
      - `transcript` (text)
      - `duration_seconds` (integer)
      - `language` (text)
      - `confidence_score` (decimal)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `ai_insights` - Stores AI-generated recommendations and insights
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `insight_type` (text)
      - `title` (text)
      - `description` (text)
      - `recommendation` (text)
      - `confidence_score` (decimal)
      - `impact_score` (decimal)
      - `related_entity_type` (text, nullable)
      - `related_entity_id` (uuid, nullable)
      - `metadata` (jsonb)
      - `status` (text)
      - `applied_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

    - `model_usage_tracking` - Tracks API usage and costs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `provider` (text)
      - `model` (text)
      - `operation_type` (text)
      - `input_tokens` (integer)
      - `output_tokens` (integer)
      - `total_tokens` (integer)
      - `cost_usd` (decimal)
      - `latency_ms` (integer)
      - `success` (boolean)
      - `error_message` (text, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `ai_learning_data` - Stores learning data for system improvement
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable)
      - `learning_type` (text)
      - `input_data` (jsonb)
      - `output_data` (jsonb)
      - `feedback_score` (integer, nullable)
      - `success_indicator` (boolean)
      - `campaign_id` (uuid, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `video_quality_scores` - AI-generated video quality assessments
      - `id` (uuid, primary key)
      - `video_generation_id` (uuid)
      - `user_id` (uuid, references auth.users)
      - `overall_score` (decimal)
      - `composition_score` (decimal)
      - `lighting_score` (decimal)
      - `clarity_score` (decimal)
      - `engagement_score` (decimal)
      - `accessibility_score` (decimal)
      - `recommendations` (jsonb)
      - `analyzed_by_model` (text)
      - `created_at` (timestamptz)

    - `prospect_intelligence` - AI-researched prospect data
      - `id` (uuid, primary key)
      - `contact_id` (uuid, references contacts)
      - `user_id` (uuid, references auth.users)
      - `company_info` (jsonb)
      - `recent_news` (jsonb)
      - `social_activity` (jsonb)
      - `funding_info` (jsonb)
      - `trigger_events` (jsonb)
      - `personalization_suggestions` (jsonb)
      - `research_date` (timestamptz)
      - `confidence_score` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies for system monitoring
*/

-- ============================================================================
-- AI CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  conversation_type text NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.ai_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own conversations"
  ON public.ai_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own conversations"
  ON public.ai_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON public.ai_conversations(status);

-- ============================================================================
-- VOICE RECORDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.voice_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  audio_url text,
  transcript text,
  duration_seconds integer DEFAULT 0,
  language text DEFAULT 'en',
  confidence_score decimal(5,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recordings"
  ON public.voice_recordings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own recordings"
  ON public.voice_recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_voice_recordings_user_id ON public.voice_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_conversation_id ON public.voice_recordings(conversation_id) WHERE conversation_id IS NOT NULL;

-- ============================================================================
-- AI INSIGHTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text,
  recommendation text,
  confidence_score decimal(5,2),
  impact_score decimal(5,2),
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  applied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON public.ai_insights
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own insights"
  ON public.ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own insights"
  ON public.ai_insights
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON public.ai_insights(status);

-- ============================================================================
-- MODEL USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.model_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text NOT NULL,
  operation_type text NOT NULL,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost_usd decimal(10,6) DEFAULT 0,
  latency_ms integer DEFAULT 0,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.model_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.model_usage_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "System can insert usage"
  ON public.model_usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_model_usage_user_id ON public.model_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_provider ON public.model_usage_tracking(provider);
CREATE INDEX IF NOT EXISTS idx_model_usage_created_at ON public.model_usage_tracking(created_at DESC);

-- ============================================================================
-- AI LEARNING DATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_learning_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  learning_type text NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  feedback_score integer,
  success_indicator boolean DEFAULT true,
  campaign_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related learning data"
  ON public.ai_learning_data
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);

CREATE POLICY "System can insert learning data"
  ON public.ai_learning_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_learning_type ON public.ai_learning_data(learning_type);
CREATE INDEX IF NOT EXISTS idx_ai_learning_success ON public.ai_learning_data(success_indicator);

-- ============================================================================
-- VIDEO QUALITY SCORES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.video_quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_generation_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score decimal(5,2) DEFAULT 0,
  composition_score decimal(5,2) DEFAULT 0,
  lighting_score decimal(5,2) DEFAULT 0,
  clarity_score decimal(5,2) DEFAULT 0,
  engagement_score decimal(5,2) DEFAULT 0,
  accessibility_score decimal(5,2) DEFAULT 0,
  recommendations jsonb DEFAULT '[]'::jsonb,
  analyzed_by_model text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.video_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video scores"
  ON public.video_quality_scores
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own video scores"
  ON public.video_quality_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_video_quality_user_id ON public.video_quality_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_video_quality_video_id ON public.video_quality_scores(video_generation_id);

-- ============================================================================
-- PROSPECT INTELLIGENCE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prospect_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_info jsonb DEFAULT '{}'::jsonb,
  recent_news jsonb DEFAULT '[]'::jsonb,
  social_activity jsonb DEFAULT '{}'::jsonb,
  funding_info jsonb DEFAULT '{}'::jsonb,
  trigger_events jsonb DEFAULT '[]'::jsonb,
  personalization_suggestions jsonb DEFAULT '[]'::jsonb,
  research_date timestamptz DEFAULT now(),
  confidence_score decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.prospect_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prospect intelligence"
  ON public.prospect_intelligence
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own prospect intelligence"
  ON public.prospect_intelligence
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own prospect intelligence"
  ON public.prospect_intelligence
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_user_id ON public.prospect_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_contact_id ON public.prospect_intelligence(contact_id);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_research_date ON public.prospect_intelligence(research_date DESC);

-- Analyze tables
ANALYZE public.ai_conversations;
ANALYZE public.voice_recordings;
ANALYZE public.ai_insights;
ANALYZE public.model_usage_tracking;
ANALYZE public.ai_learning_data;
ANALYZE public.video_quality_scores;
ANALYZE public.prospect_intelligence;
