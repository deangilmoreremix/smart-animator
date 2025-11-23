/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add missing indexes for foreign keys on campaign_recipients and campaigns tables
    - Optimize all RLS policies by wrapping auth.uid() calls with SELECT to prevent re-evaluation per row
    - Fix function search path mutability issues
  
  2. Security Improvements
    - Consolidate multiple permissive policies on announcements table into single policies
    
  3. Changes Made
    - Add index on campaign_recipients.contact_id
    - Add index on campaigns.master_video_id
    - Recreate all RLS policies with optimized auth.uid() calls using (SELECT auth.uid())
    - Set search_path for functions to be immutable
    - Merge announcement policies to avoid multiple permissive policies per action
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id_fk 
  ON campaign_recipients(contact_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_master_video_id_fk 
  ON campaigns(master_video_id);

-- Fix function search paths (set to be immutable)
ALTER FUNCTION update_list_contact_count() SECURITY DEFINER SET search_path = public, pg_temp;
ALTER FUNCTION update_updated_at_column() SECURITY DEFINER SET search_path = public, pg_temp;

-- Drop and recreate all RLS policies with optimized auth.uid() calls
-- This wraps auth.uid() in SELECT to prevent re-evaluation per row

-- contacts table policies
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- lists table policies
DROP POLICY IF EXISTS "Users can view own lists" ON lists;
DROP POLICY IF EXISTS "Users can create own lists" ON lists;
DROP POLICY IF EXISTS "Users can update own lists" ON lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON lists;

CREATE POLICY "Users can view own lists"
  ON lists FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own lists"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own lists"
  ON lists FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own lists"
  ON lists FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- list_contacts table policies
DROP POLICY IF EXISTS "Users can view own list contacts" ON list_contacts;
DROP POLICY IF EXISTS "Users can add contacts to own lists" ON list_contacts;
DROP POLICY IF EXISTS "Users can remove contacts from own lists" ON list_contacts;

CREATE POLICY "Users can view own list contacts"
  ON list_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_contacts.list_id
      AND lists.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can add contacts to own lists"
  ON list_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_contacts.list_id
      AND lists.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can remove contacts from own lists"
  ON list_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_contacts.list_id
      AND lists.user_id = (SELECT auth.uid())
    )
  );

-- campaigns table policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;

CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- sends table policies
DROP POLICY IF EXISTS "Users can view own sends" ON sends;
DROP POLICY IF EXISTS "Users can create own sends" ON sends;
DROP POLICY IF EXISTS "Users can update own sends" ON sends;

CREATE POLICY "Users can view own sends"
  ON sends FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create own sends"
  ON sends FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own sends"
  ON sends FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sends.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- events table policies
DROP POLICY IF EXISTS "Users can view own events" ON events;

CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sends
      JOIN campaigns ON campaigns.id = sends.campaign_id
      WHERE sends.id = events.send_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- templates table policies
DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can create own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- social_accounts table policies
DROP POLICY IF EXISTS "Users can view own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can create own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can update own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can delete own social accounts" ON social_accounts;

CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ai_generations table policies
DROP POLICY IF EXISTS "Users can view own ai generations" ON ai_generations;
DROP POLICY IF EXISTS "Users can create own ai generations" ON ai_generations;

CREATE POLICY "Users can view own ai generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own ai generations"
  ON ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- audit_logs table policies
DROP POLICY IF EXISTS "Superadmins can view audit logs" ON audit_logs;

CREATE POLICY "Superadmins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'superadmin'
      AND user_roles.status = 'active'
    )
  );

-- personalization_templates table policies
DROP POLICY IF EXISTS "Users can view own and public templates" ON personalization_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON personalization_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON personalization_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON personalization_templates;

CREATE POLICY "Users can view own and public templates"
  ON personalization_templates FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR is_public = true);

CREATE POLICY "Users can insert own templates"
  ON personalization_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own templates"
  ON personalization_templates FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own templates"
  ON personalization_templates FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- announcements table policies - Fix multiple permissive policies issue
-- Combine into single policies per action
DROP POLICY IF EXISTS "Superadmins can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view active announcements" ON announcements;

CREATE POLICY "Users can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    -- Superadmins can see all announcements
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'superadmin'
      AND user_roles.status = 'active'
    )
    OR
    -- Regular users can see active announcements
    (
      is_active = true
      AND now() >= starts_at
      AND (ends_at IS NULL OR now() <= ends_at)
    )
  );

CREATE POLICY "Superadmins can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'superadmin'
      AND user_roles.status = 'active'
    )
  );

CREATE POLICY "Superadmins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'superadmin'
      AND user_roles.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'superadmin'
      AND user_roles.status = 'active'
    )
  );

CREATE POLICY "Superadmins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'superadmin'
      AND user_roles.status = 'active'
    )
  );

-- campaign_recipients table policies
DROP POLICY IF EXISTS "Users can view own campaign recipients" ON campaign_recipients;
DROP POLICY IF EXISTS "Users can insert own campaign recipients" ON campaign_recipients;
DROP POLICY IF EXISTS "Users can update own campaign recipients" ON campaign_recipients;
DROP POLICY IF EXISTS "Users can delete own campaign recipients" ON campaign_recipients;

CREATE POLICY "Users can view own campaign recipients"
  ON campaign_recipients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own campaign recipients"
  ON campaign_recipients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own campaign recipients"
  ON campaign_recipients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own campaign recipients"
  ON campaign_recipients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- personalization_assets table policies
DROP POLICY IF EXISTS "Users can view own personalization assets" ON personalization_assets;
DROP POLICY IF EXISTS "Users can insert own personalization assets" ON personalization_assets;

CREATE POLICY "Users can view own personalization assets"
  ON personalization_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaign_recipients
      JOIN campaigns ON campaigns.id = campaign_recipients.campaign_id
      WHERE campaign_recipients.id = personalization_assets.recipient_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own personalization assets"
  ON personalization_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_recipients
      JOIN campaigns ON campaigns.id = campaign_recipients.campaign_id
      WHERE campaign_recipients.id = personalization_assets.recipient_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- campaign_analytics table policies
DROP POLICY IF EXISTS "Users can view own campaign analytics" ON campaign_analytics;
DROP POLICY IF EXISTS "Users can insert own campaign analytics" ON campaign_analytics;
DROP POLICY IF EXISTS "Users can update own campaign analytics" ON campaign_analytics;

CREATE POLICY "Users can view own campaign analytics"
  ON campaign_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own campaign analytics"
  ON campaign_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own campaign analytics"
  ON campaign_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );