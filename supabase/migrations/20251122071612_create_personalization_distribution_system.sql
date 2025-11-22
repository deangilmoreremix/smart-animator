/*
  # Create Personalization & Multi-Channel Distribution System

  ## Overview
  This migration creates the complete database schema for a free, open-source
  personalization and multi-channel distribution system with Ollama AI integration.

  ## New Tables

  ### 1. contacts
  Stores contact information for personalized video distribution
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `email` (text, nullable)
  - `phone` (text, nullable)
  - `first_name` (text)
  - `last_name` (text, nullable)
  - `company` (text, nullable)
  - `industry` (text, nullable)
  - `custom_fields` (jsonb) - flexible additional data
  - `tags` (text array) - for segmentation
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. lists
  Contact list management for organizing contacts into segments
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text)
  - `description` (text, nullable)
  - `contact_count` (integer) - cached count for performance
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. list_contacts
  Many-to-many relationship between lists and contacts
  - `list_id` (uuid, foreign key to lists)
  - `contact_id` (uuid, foreign key to contacts)
  - `added_at` (timestamptz)
  - Composite primary key on (list_id, contact_id)

  ### 4. campaigns
  Video distribution campaigns across multiple channels
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `video_id` (uuid, foreign key to video_generations, nullable)
  - `name` (text)
  - `subject` (text, nullable) - for email campaigns
  - `message_template` (text) - with merge tags like {{firstName}}
  - `channels` (text array) - ['email', 'sms', 'social']
  - `status` (text) - draft, scheduled, sending, completed, cancelled
  - `scheduled_at` (timestamptz, nullable)
  - `started_at` (timestamptz, nullable)
  - `completed_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. sends
  Individual message sends to contacts
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, foreign key to campaigns)
  - `contact_id` (uuid, foreign key to contacts)
  - `channel` (text) - email, sms, facebook, twitter, etc.
  - `status` (text) - pending, sent, delivered, failed, bounced
  - `personalized_subject` (text, nullable) - AI-generated subject
  - `personalized_message` (text, nullable) - AI-generated message
  - `error_message` (text, nullable)
  - `sent_at` (timestamptz, nullable)
  - `delivered_at` (timestamptz, nullable)
  - `created_at` (timestamptz)

  ### 6. events
  Tracking opens, clicks, views for analytics
  - `id` (uuid, primary key)
  - `send_id` (uuid, foreign key to sends)
  - `event_type` (text) - opened, clicked, viewed, shared
  - `metadata` (jsonb) - additional event data (device, location, etc.)
  - `created_at` (timestamptz)

  ### 7. templates
  Reusable templates for messages and content
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text)
  - `type` (text) - email, sms, social
  - `subject_template` (text, nullable)
  - `content_template` (text)
  - `merge_tags` (text array) - available variables
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. social_accounts
  Connected social media accounts for posting
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `platform` (text) - facebook, instagram, twitter, linkedin, youtube
  - `account_name` (text)
  - `access_token` (text) - encrypted
  - `refresh_token` (text, nullable) - encrypted
  - `token_expires_at` (timestamptz, nullable)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. ai_generations
  Track AI-generated content for analytics and improvement
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `generation_type` (text) - subject, caption, hashtags, message
  - `prompt` (text) - what was sent to AI
  - `response` (text) - AI-generated content
  - `model` (text) - ollama model used
  - `context` (jsonb) - contact data, campaign info
  - `used_in_send_id` (uuid, nullable)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Restrictive policies for select, insert, update, delete operations

  ## Indexes
  - Added indexes on frequently queried columns for performance
  - Foreign key indexes for join performance
  - Composite indexes for common query patterns
*/

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  first_name text NOT NULL,
  last_name text,
  company text,
  industry text,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING gin(tags);

-- =====================================================
-- LISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  contact_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lists"
  ON lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);

-- =====================================================
-- LIST_CONTACTS TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS list_contacts (
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (list_id, contact_id)
);

ALTER TABLE list_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own list contacts"
  ON list_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_contacts.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add contacts to own lists"
  ON list_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_contacts.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove contacts from own lists"
  ON list_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_contacts.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_list_contacts_list_id ON list_contacts(list_id);
CREATE INDEX IF NOT EXISTS idx_list_contacts_contact_id ON list_contacts(contact_id);

-- =====================================================
-- CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid REFERENCES video_generations(id) ON DELETE SET NULL,
  name text NOT NULL,
  subject text,
  message_template text NOT NULL,
  channels text[] DEFAULT ARRAY['email']::text[],
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled'))
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_video_id ON campaigns(video_id);

-- =====================================================
-- SENDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel text NOT NULL,
  status text DEFAULT 'pending',
  personalized_subject text,
  personalized_message text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_send_status CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced'))
);

ALTER TABLE sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sends"
  ON sends FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own sends"
  ON sends FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sends"
  ON sends FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_sends_campaign_id ON sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sends_contact_id ON sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_sends_status ON sends(status);
CREATE INDEX IF NOT EXISTS idx_sends_channel ON sends(channel);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid NOT NULL REFERENCES sends(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('opened', 'clicked', 'viewed', 'shared', 'bounced', 'complained'))
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sends
      JOIN campaigns ON campaigns.id = sends.campaign_id
      WHERE sends.id = events.send_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can create events"
  ON events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_events_send_id ON events(send_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- =====================================================
-- TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  subject_template text,
  content_template text NOT NULL,
  merge_tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_template_type CHECK (type IN ('email', 'sms', 'social'))
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);

-- =====================================================
-- SOCIAL_ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  account_name text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_platform CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest'))
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);

-- =====================================================
-- AI_GENERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type text NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  model text DEFAULT 'llama3.1',
  context jsonb DEFAULT '{}'::jsonb,
  used_in_send_id uuid REFERENCES sends(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_generation_type CHECK (generation_type IN ('subject', 'caption', 'hashtags', 'message', 'body', 'cta'))
);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ai generations"
  ON ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_send_id ON ai_generations(used_in_send_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update contact count in lists
CREATE OR REPLACE FUNCTION update_list_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lists
    SET contact_count = contact_count + 1,
        updated_at = now()
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lists
    SET contact_count = GREATEST(contact_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_list_contact_count
AFTER INSERT OR DELETE ON list_contacts
FOR EACH ROW
EXECUTE FUNCTION update_list_contact_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_lists_updated_at
BEFORE UPDATE ON lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_social_accounts_updated_at
BEFORE UPDATE ON social_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
