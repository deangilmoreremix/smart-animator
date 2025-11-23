/*
  # Create Audit Log Table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key) - Unique identifier for each audit log entry
      - `user_id` (uuid) - ID of the user whose role was changed
      - `changed_by` (uuid) - ID of the superadmin who made the change
      - `action` (text) - Type of action (role_update, user_delete)
      - `old_value` (text, nullable) - Previous value (e.g., old role)
      - `new_value` (text, nullable) - New value (e.g., new role)
      - `created_at` (timestamp) - When the action occurred

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policy for superadmins to view audit logs
    - Audit logs are read-only for all users (no updates or deletes allowed)

  3. Indexes
    - Index on user_id for faster lookups
    - Index on changed_by for tracking who made changes
    - Index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  changed_by uuid NOT NULL,
  action text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'superadmin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);