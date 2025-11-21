/*
  # Fix RLS Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified in the database:

  1. **RLS Policy Optimization**: Fixes auth function calls in RLS policies to use `(select auth.uid())`
     instead of `auth.uid()` to prevent re-evaluation for each row, improving query performance at scale.

  2. **Function Search Path Security**: Adds explicit `SET search_path` to all security-critical functions
     to prevent search path manipulation attacks.

  3. **Index Optimization**: Removes unused indexes that provide no performance benefit and waste storage.

  4. **Policy Consolidation**: Fixes multiple permissive policies issue by combining them into a single
     more efficient policy.

  ## Changes to video_generations table
  - Drop and recreate 4 RLS policies with optimized auth function calls:
    - Users can view own video generations
    - Users can create video generations
    - Users can update own video generations
    - Users can delete own video generations
  - Remove 3 unused indexes (idx_video_generations_user_id, idx_video_generations_created_at, idx_video_generations_status)

  ## Changes to user_roles table
  - Drop and recreate 5 RLS policies with optimized auth function calls:
    - Users can read own role (combined with superadmin read policy)
    - Superadmins can insert roles
    - Superadmins can update roles
    - Superadmins can delete roles
  - Remove 2 unused indexes (user_roles_user_id_idx, user_roles_role_idx)

  ## Changes to functions
  - Add `SET search_path = public, pg_temp` to:
    - is_admin()
    - is_superadmin()
    - get_user_role()
    - handle_new_user()
    - update_updated_at_column()

  ## Security Impact
  - All changes maintain existing access control logic
  - Performance improvements prevent denial of service through expensive queries
  - Search path fixes prevent privilege escalation attacks
*/

-- ============================================================================
-- FIX VIDEO_GENERATIONS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own video generations" ON video_generations;
DROP POLICY IF EXISTS "Users can create video generations" ON video_generations;
DROP POLICY IF EXISTS "Users can update own video generations" ON video_generations;
DROP POLICY IF EXISTS "Users can delete own video generations" ON video_generations;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view own video generations"
  ON video_generations
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create video generations"
  ON video_generations
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own video generations"
  ON video_generations
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own video generations"
  ON video_generations
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- FIX USER_ROLES TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can delete roles" ON user_roles;

-- Recreate combined SELECT policy (fixes multiple permissive policies issue)
CREATE POLICY "Users can read roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid()) AND ur.role = 'superadmin'
    )
  );

-- Recreate other policies with optimized auth function calls
CREATE POLICY "Superadmins can insert roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid()) AND ur.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can update roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid()) AND ur.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid()) AND ur.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can delete roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid()) AND ur.role = 'superadmin'
    )
  );

-- ============================================================================
-- REMOVE UNUSED INDEXES
-- ============================================================================

-- Video generations table indexes
DROP INDEX IF EXISTS idx_video_generations_user_id;
DROP INDEX IF EXISTS idx_video_generations_created_at;
DROP INDEX IF EXISTS idx_video_generations_status;

-- User roles table indexes
DROP INDEX IF EXISTS user_roles_user_id_idx;
DROP INDEX IF EXISTS user_roles_role_idx;

-- ============================================================================
-- FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix is_superadmin function
CREATE OR REPLACE FUNCTION is_superadmin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM user_roles WHERE user_id = user_uuid;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;
