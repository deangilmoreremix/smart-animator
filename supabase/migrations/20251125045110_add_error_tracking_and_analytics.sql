/*
  # Add Error Tracking and Enhanced Analytics

  1. New Tables
    - `error_logs`
      - `id` (uuid, primary key)
      - `error_message` (text)
      - `error_category` (text)
      - `error_severity` (text)
      - `error_stack` (text)
      - `user_id` (uuid, foreign key)
      - `campaign_id` (uuid, foreign key, nullable)
      - `recipient_id` (uuid, foreign key, nullable)
      - `action` (text)
      - `metadata` (jsonb)
      - `occurred_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Schema Changes
    - Add `view_count` to `campaign_recipients`
    - Add `conversion_type` and `conversion_value` to `campaign_recipients`
    - Add `paused` status to campaigns
    - Add storage bucket for personalized videos

  3. Database Functions
    - `increment_campaign_views` for atomic view counting
    - `increment_campaign_conversions` for conversion tracking

  4. Security
    - Enable RLS on `error_logs`
    - Add policies for users to read their own error logs
    - Add policies for admins to read all error logs
*/

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_category text NOT NULL DEFAULT 'unknown',
  error_severity text NOT NULL DEFAULT 'medium',
  error_stack text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES campaign_recipients(id) ON DELETE SET NULL,
  action text,
  metadata jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own error logs"
  ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND status = 'active'
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_recipients' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE campaign_recipients ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_recipients' AND column_name = 'conversion_type'
  ) THEN
    ALTER TABLE campaign_recipients ADD COLUMN conversion_type text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_recipients' AND column_name = 'conversion_value'
  ) THEN
    ALTER TABLE campaign_recipients ADD COLUMN conversion_value numeric(10,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'paused_at'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN paused_at timestamptz;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION increment_campaign_views(
  campaign_id uuid,
  unique_view boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaign_analytics
  SET
    total_views = total_views + 1,
    unique_views = CASE WHEN unique_view THEN unique_views + 1 ELSE unique_views END,
    updated_at = now()
  WHERE campaign_analytics.campaign_id = increment_campaign_views.campaign_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_campaign_conversions(
  campaign_id uuid,
  conversion_value numeric DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaign_analytics
  SET
    total_conversions = COALESCE(total_conversions, 0) + 1,
    total_conversion_value = COALESCE(total_conversion_value, 0) + conversion_value,
    updated_at = now()
  WHERE campaign_analytics.campaign_id = increment_campaign_conversions.campaign_id;

  IF NOT FOUND THEN
    INSERT INTO campaign_analytics (
      campaign_id,
      total_conversions,
      total_conversion_value
    ) VALUES (
      increment_campaign_conversions.campaign_id,
      1,
      conversion_value
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_analytics' AND column_name = 'total_conversions'
  ) THEN
    ALTER TABLE campaign_analytics ADD COLUMN total_conversions integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_analytics' AND column_name = 'total_conversion_value'
  ) THEN
    ALTER TABLE campaign_analytics ADD COLUMN total_conversion_value numeric(10,2) DEFAULT 0;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('personalized-videos', 'personalized-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'personalized-videos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'personalized-videos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view videos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'personalized-videos');
