/*
  # Fix Security Issues - Part 2: RLS Policy Optimization

  1. RLS Performance Optimization
    - Wrap auth functions with SELECT to prevent re-evaluation per row
    - Combine multiple permissive SELECT policies into single policy
    
  2. Tables Updated:
    - error_logs: Optimized and combined policies
    - user_profiles: Optimized auth function calls
    - user_progress: Optimized auth function calls
*/

-- ============================================================================
-- ERROR_LOGS: Fix multiple permissive policies and optimize auth calls
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Admins can read all error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Users can insert own error logs" ON public.error_logs;

-- Create single combined SELECT policy
CREATE POLICY "Users can read error logs"
  ON public.error_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert own error logs"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- USER_PROFILES: Optimize auth function calls
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- USER_PROGRESS: Optimize auth function calls
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own progress"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own progress"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
