/*
  # Create System Announcements Table

  1. New Tables
    - `announcements`
      - `id` (uuid, primary key) - Unique identifier
      - `created_by` (uuid) - Admin who created the announcement
      - `title` (text) - Announcement title
      - `message` (text) - Announcement content
      - `type` (text) - Type: info, warning, success, error
      - `target_roles` (text array) - Which roles can see it: ['user', 'admin', 'superadmin']
      - `is_active` (boolean) - Whether announcement is shown
      - `starts_at` (timestamp, nullable) - When to start showing
      - `ends_at` (timestamp, nullable) - When to stop showing
      - `created_at` (timestamp) - Creation time

  2. Security
    - Enable RLS on announcements table
    - Superadmins can create, update, delete announcements
    - All authenticated users can view active announcements for their role

  3. Indexes
    - Index on is_active for fast filtering
    - Index on created_at for sorting
    - Index on target_roles for role-based queries
*/

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  target_roles text[] DEFAULT ARRAY['user', 'admin', 'superadmin']::text[],
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_announcement_type CHECK (type IN ('info', 'warning', 'success', 'error'))
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'superadmin'
    )
  );

CREATE POLICY "Users can view active announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
    AND (
      target_roles @> ARRAY(
        SELECT role FROM user_roles WHERE user_id = auth.uid()
      )::text[]
    )
  );

CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_target_roles ON announcements USING gin(target_roles);