/*
  # Fix Security Issues - Part 3: Remove Unused Indexes

  1. Index Cleanup
    - Remove indexes that are not being used by queries
    - Reduces storage and maintenance overhead
    
  2. Indexes Removed:
    - idx_user_profiles_user_id (replaced by primary key)
    - idx_help_articles_page_context (not used)
    - idx_help_articles_category (not used)
    - idx_user_progress_user_id (replaced by primary key)
    - idx_user_progress_achievement (not used)
*/

-- Remove unused indexes
DROP INDEX IF EXISTS public.idx_user_profiles_user_id;
DROP INDEX IF EXISTS public.idx_help_articles_page_context;
DROP INDEX IF EXISTS public.idx_help_articles_category;
DROP INDEX IF EXISTS public.idx_user_progress_user_id;
DROP INDEX IF EXISTS public.idx_user_progress_achievement;
