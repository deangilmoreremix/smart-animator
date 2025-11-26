/*
  # Fix Security Issues - Part 4: Function Security

  1. Function Search Path Security
    - Set immutable search_path for security functions
    - Prevents search_path hijacking attacks
    
  2. Functions Updated:
    - increment_campaign_views
    - increment_campaign_conversions
    - get_or_create_user_profile
    - update_onboarding_progress
*/

-- ============================================================================
-- DROP AND RECREATE FUNCTIONS WITH SECURE SEARCH PATHS
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.increment_campaign_views(uuid);
DROP FUNCTION IF EXISTS public.increment_campaign_conversions(uuid);
DROP FUNCTION IF EXISTS public.get_or_create_user_profile(uuid);
DROP FUNCTION IF EXISTS public.update_onboarding_progress(uuid, jsonb);

-- Recreate increment_campaign_views with secure search_path
CREATE OR REPLACE FUNCTION public.increment_campaign_views(campaign_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.campaigns
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = campaign_id_param;
END;
$$;

-- Recreate increment_campaign_conversions with secure search_path
CREATE OR REPLACE FUNCTION public.increment_campaign_conversions(campaign_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.campaigns
  SET conversion_count = COALESCE(conversion_count, 0) + 1
  WHERE id = campaign_id_param;
END;
$$;

-- Recreate get_or_create_user_profile with secure search_path
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  INSERT INTO public.user_profiles (user_id, role, status, metadata)
  VALUES (user_id_param, 'user', 'active', '{}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT jsonb_build_object(
    'user_id', up.user_id,
    'role', up.role,
    'status', up.status,
    'metadata', up.metadata,
    'created_at', up.created_at,
    'updated_at', up.updated_at
  ) INTO result
  FROM public.user_profiles up
  WHERE up.user_id = user_id_param;

  RETURN result;
END;
$$;

-- Recreate update_onboarding_progress with secure search_path
CREATE OR REPLACE FUNCTION public.update_onboarding_progress(
  user_id_param uuid,
  progress_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, progress_data)
  VALUES (user_id_param, progress_data)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    progress_data = EXCLUDED.progress_data,
    updated_at = NOW();
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_campaign_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_campaign_conversions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress(uuid, jsonb) TO authenticated;
