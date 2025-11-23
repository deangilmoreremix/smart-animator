/*
  # Add User Status and Metadata

  1. Changes to Tables
    - Add columns to `user_roles` table:
      - `status` (text) - User account status: active, suspended, banned, trial
      - `suspension_reason` (text, nullable) - Reason for suspension/ban
      - `suspension_until` (timestamp, nullable) - When suspension expires
      - `last_login_at` (timestamp, nullable) - Track last login time
      - `last_login_ip` (text, nullable) - Track last login IP address
      - `notes` (text, nullable) - Admin notes about the user

  2. Default Values
    - All existing users default to 'active' status
    - Suspension fields default to null

  3. Constraints
    - Status must be one of: active, suspended, banned, trial

  4. Important Notes
    - This migration adds columns safely using IF NOT EXISTS pattern
    - Existing data is preserved
    - No RLS changes needed - existing policies cover new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN status text DEFAULT 'active';
    ALTER TABLE user_roles ADD CONSTRAINT valid_user_status 
      CHECK (status IN ('active', 'suspended', 'banned', 'trial'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'suspension_reason'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN suspension_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'suspension_until'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN suspension_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN last_login_ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'notes'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN notes text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_roles_status ON user_roles(status);