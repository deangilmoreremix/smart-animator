/*
  # Add Advanced Dynamic Personalization System

  ## Overview
  This migration extends the existing campaigns system with advanced personalization capabilities
  including recipient-level customization, AI-generated assets, and detailed analytics.

  ## New Tables

  ### 1. campaign_recipients
  Individual recipient data with personalization variables and tracking
  - Stores each recipient's data for personalized video generation
  - Tracks generation status, costs, and viewing analytics
  - Links to contacts table for integration with existing contact management

  ### 2. personalization_assets
  AI-generated assets for each recipient (intros, overlays, CTAs, B-roll)
  - Stores generated intro videos, text overlays, custom CTAs
  - Tracks generation costs and prompts used
  - Supports multiple asset types per recipient

  ### 3. campaign_analytics
  Aggregate campaign performance metrics
  - Real-time campaign performance tracking
  - View rates, completion rates, response tracking
  - Cost analysis and ROI metrics

  ### 4. personalization_templates
  Reusable personalization templates
  - Pre-built templates for common use cases
  - Support for public template sharing
  - Usage tracking for popular templates

  ## Security
  - All tables have RLS enabled
  - Users can only access their own campaign data
  - Public templates are visible to all authenticated users
*/

-- Create campaign_recipients table
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text,
  company text,
  role text,
  industry text,
  pain_point text,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  personalized_video_url text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'pending',
  generation_cost numeric(10,4),
  processing_time_ms integer,
  error_message text,
  sent_at timestamptz,
  viewed_at timestamptz,
  view_count integer DEFAULT 0,
  watch_duration_seconds integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'ready', 'sent', 'failed', 'viewed'))
);

-- Create personalization_assets table
CREATE TABLE IF NOT EXISTS personalization_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  asset_url text,
  asset_data jsonb DEFAULT '{}'::jsonb,
  gemini_prompt_used text NOT NULL,
  generation_time_ms integer NOT NULL,
  cost numeric(10,4),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_asset_type CHECK (asset_type IN ('intro', 'overlay', 'cta', 'broll', 'caption', 'thumbnail', 'background'))
);

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
  total_recipients integer DEFAULT 0,
  videos_generated integer DEFAULT 0,
  videos_sent integer DEFAULT 0,
  total_views integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  avg_watch_time_seconds numeric(10,2),
  completion_rate numeric(5,2),
  response_rate numeric(5,2),
  total_cost numeric(10,4) DEFAULT 0,
  avg_generation_time_ms integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create personalization_templates table
CREATE TABLE IF NOT EXISTS personalization_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  description text,
  use_case text NOT NULL,
  personalization_tier text NOT NULL DEFAULT 'basic',
  default_fields jsonb DEFAULT '[]'::jsonb,
  script_template text NOT NULL,
  visual_style jsonb,
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_use_case CHECK (use_case IN ('cold_outreach', 'abm', 'onboarding', 'follow_up', 'nurture')),
  CONSTRAINT valid_tier CHECK (personalization_tier IN ('basic', 'smart', 'advanced'))
);

-- Add new columns to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'personalization_tier') THEN
    ALTER TABLE campaigns ADD COLUMN personalization_tier text DEFAULT 'basic';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'template_script') THEN
    ALTER TABLE campaigns ADD COLUMN template_script text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'personalization_fields') THEN
    ALTER TABLE campaigns ADD COLUMN personalization_fields jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'visual_style') THEN
    ALTER TABLE campaigns ADD COLUMN visual_style jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'master_video_id') THEN
    ALTER TABLE campaigns ADD COLUMN master_video_id uuid REFERENCES video_generations(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'total_recipients') THEN
    ALTER TABLE campaigns ADD COLUMN total_recipients integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'processing_status') THEN
    ALTER TABLE campaigns ADD COLUMN processing_status text DEFAULT 'draft';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_email ON campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_personalization_assets_recipient_id ON personalization_assets(recipient_id);
CREATE INDEX IF NOT EXISTS idx_personalization_assets_asset_type ON personalization_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_personalization_templates_user_id ON personalization_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_personalization_templates_use_case ON personalization_templates(use_case);

-- Enable RLS
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_recipients
CREATE POLICY "Users can view own campaign recipients" ON campaign_recipients FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_recipients.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can insert own campaign recipients" ON campaign_recipients FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_recipients.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can update own campaign recipients" ON campaign_recipients FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_recipients.campaign_id AND campaigns.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_recipients.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can delete own campaign recipients" ON campaign_recipients FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_recipients.campaign_id AND campaigns.user_id = auth.uid()));

-- RLS Policies for personalization_assets
CREATE POLICY "Users can view own personalization assets" ON personalization_assets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM campaign_recipients JOIN campaigns ON campaigns.id = campaign_recipients.campaign_id WHERE campaign_recipients.id = personalization_assets.recipient_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can insert own personalization assets" ON personalization_assets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM campaign_recipients JOIN campaigns ON campaigns.id = campaign_recipients.campaign_id WHERE campaign_recipients.id = personalization_assets.recipient_id AND campaigns.user_id = auth.uid()));

-- RLS Policies for campaign_analytics
CREATE POLICY "Users can view own campaign analytics" ON campaign_analytics FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can insert own campaign analytics" ON campaign_analytics FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can update own campaign analytics" ON campaign_analytics FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.user_id = auth.uid()));

-- RLS Policies for personalization_templates
CREATE POLICY "Users can view own and public templates" ON personalization_templates FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_public = true);
CREATE POLICY "Users can insert own templates" ON personalization_templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own templates" ON personalization_templates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own templates" ON personalization_templates FOR DELETE TO authenticated USING (user_id = auth.uid());