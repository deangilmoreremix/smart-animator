/*
  # Fix Security Issues - Part 1: Foreign Key Indexes

  1. Performance Improvements
    - Add missing indexes for all foreign keys to improve query performance
    
  2. Foreign Key Indexes Added:
    - ai_generations: used_in_send_id, user_id
    - campaign_recipients: campaign_id, contact_id
    - campaigns: master_video_id, video_id
    - error_logs: campaign_id, recipient_id, user_id
    - events: send_id
    - list_contacts: contact_id
    - lists: user_id
    - personalization_assets: recipient_id
    - personalization_templates: user_id
    - sends: campaign_id, contact_id
    - social_accounts: user_id
    - templates: user_id
*/

-- ai_generations indexes
CREATE INDEX IF NOT EXISTS idx_ai_generations_used_in_send_id 
  ON public.ai_generations(used_in_send_id) 
  WHERE used_in_send_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id 
  ON public.ai_generations(user_id);

-- campaign_recipients indexes
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id 
  ON public.campaign_recipients(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id 
  ON public.campaign_recipients(contact_id);

-- campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_master_video_id 
  ON public.campaigns(master_video_id) 
  WHERE master_video_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_video_id 
  ON public.campaigns(video_id) 
  WHERE video_id IS NOT NULL;

-- error_logs indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_campaign_id 
  ON public.error_logs(campaign_id) 
  WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_error_logs_recipient_id 
  ON public.error_logs(recipient_id) 
  WHERE recipient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id 
  ON public.error_logs(user_id);

-- events indexes
CREATE INDEX IF NOT EXISTS idx_events_send_id 
  ON public.events(send_id);

-- list_contacts indexes
CREATE INDEX IF NOT EXISTS idx_list_contacts_contact_id 
  ON public.list_contacts(contact_id);

-- lists indexes
CREATE INDEX IF NOT EXISTS idx_lists_user_id 
  ON public.lists(user_id);

-- personalization_assets indexes
CREATE INDEX IF NOT EXISTS idx_personalization_assets_recipient_id 
  ON public.personalization_assets(recipient_id);

-- personalization_templates indexes
CREATE INDEX IF NOT EXISTS idx_personalization_templates_user_id 
  ON public.personalization_templates(user_id);

-- sends indexes
CREATE INDEX IF NOT EXISTS idx_sends_campaign_id 
  ON public.sends(campaign_id);

CREATE INDEX IF NOT EXISTS idx_sends_contact_id 
  ON public.sends(contact_id);

-- social_accounts indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id 
  ON public.social_accounts(user_id);

-- templates indexes
CREATE INDEX IF NOT EXISTS idx_templates_user_id 
  ON public.templates(user_id);

-- Analyze tables to update statistics
ANALYZE public.ai_generations;
ANALYZE public.campaign_recipients;
ANALYZE public.campaigns;
ANALYZE public.error_logs;
ANALYZE public.events;
ANALYZE public.list_contacts;
ANALYZE public.lists;
ANALYZE public.personalization_assets;
ANALYZE public.personalization_templates;
ANALYZE public.sends;
ANALYZE public.social_accounts;
ANALYZE public.templates;
