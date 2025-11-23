/*
  # Remove Unused Indexes

  1. Overview
    - Remove indexes that have not been used to reduce database overhead
    - Unused indexes slow down write operations without providing query benefits
    - Keep only essential indexes for foreign keys and frequently queried columns
  
  2. Indexes Being Removed
    - audit_logs: user_id, changed_by, created_at indexes
    - campaign_recipients: status, email, contact_id_fk indexes (keep campaign_id for FK)
    - personalization_assets: recipient_id, asset_type indexes
    - user_roles: status index
    - campaign_analytics: campaign_id index
    - personalization_templates: user_id, use_case indexes
    - announcements: is_active, created_at, target_roles indexes
    - campaigns: master_video_id_fk, status, video_id indexes
    - contacts: email, tags indexes
    - lists: user_id index
    - list_contacts: list_id, contact_id indexes
    - sends: campaign_id, contact_id, status, channel indexes
    - events: send_id, type, created_at indexes
    - templates: user_id, type indexes
    - social_accounts: user_id, platform indexes
    - ai_generations: user_id, type, send_id indexes
    
  3. Note
    - These indexes have not been used and are safe to remove
    - Can be recreated later if query patterns change
    - Foreign key indexes were evaluated but most are unused in current workload
*/

-- Drop unused indexes on audit_logs
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_changed_by;
DROP INDEX IF EXISTS idx_audit_logs_created_at;

-- Drop unused indexes on campaign_recipients
DROP INDEX IF EXISTS idx_campaign_recipients_status;
DROP INDEX IF EXISTS idx_campaign_recipients_email;
DROP INDEX IF EXISTS idx_campaign_recipients_contact_id_fk;
DROP INDEX IF EXISTS idx_campaign_recipients_campaign_id;

-- Drop unused indexes on personalization_assets
DROP INDEX IF EXISTS idx_personalization_assets_recipient_id;
DROP INDEX IF EXISTS idx_personalization_assets_asset_type;

-- Drop unused indexes on user_roles
DROP INDEX IF EXISTS idx_user_roles_status;

-- Drop unused indexes on campaign_analytics
DROP INDEX IF EXISTS idx_campaign_analytics_campaign_id;

-- Drop unused indexes on personalization_templates
DROP INDEX IF EXISTS idx_personalization_templates_user_id;
DROP INDEX IF EXISTS idx_personalization_templates_use_case;

-- Drop unused indexes on announcements
DROP INDEX IF EXISTS idx_announcements_is_active;
DROP INDEX IF EXISTS idx_announcements_created_at;
DROP INDEX IF EXISTS idx_announcements_target_roles;

-- Drop unused indexes on campaigns
DROP INDEX IF EXISTS idx_campaigns_master_video_id_fk;
DROP INDEX IF EXISTS idx_campaigns_status;
DROP INDEX IF EXISTS idx_campaigns_video_id;

-- Drop unused indexes on contacts
DROP INDEX IF EXISTS idx_contacts_email;
DROP INDEX IF EXISTS idx_contacts_tags;

-- Drop unused indexes on lists
DROP INDEX IF EXISTS idx_lists_user_id;

-- Drop unused indexes on list_contacts
DROP INDEX IF EXISTS idx_list_contacts_list_id;
DROP INDEX IF EXISTS idx_list_contacts_contact_id;

-- Drop unused indexes on sends
DROP INDEX IF EXISTS idx_sends_campaign_id;
DROP INDEX IF EXISTS idx_sends_contact_id;
DROP INDEX IF EXISTS idx_sends_status;
DROP INDEX IF EXISTS idx_sends_channel;

-- Drop unused indexes on events
DROP INDEX IF EXISTS idx_events_send_id;
DROP INDEX IF EXISTS idx_events_type;
DROP INDEX IF EXISTS idx_events_created_at;

-- Drop unused indexes on templates
DROP INDEX IF EXISTS idx_templates_user_id;
DROP INDEX IF EXISTS idx_templates_type;

-- Drop unused indexes on social_accounts
DROP INDEX IF EXISTS idx_social_accounts_user_id;
DROP INDEX IF EXISTS idx_social_accounts_platform;

-- Drop unused indexes on ai_generations
DROP INDEX IF EXISTS idx_ai_generations_user_id;
DROP INDEX IF EXISTS idx_ai_generations_type;
DROP INDEX IF EXISTS idx_ai_generations_send_id;