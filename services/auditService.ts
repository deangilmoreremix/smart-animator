import { supabase } from './supabase';

export interface AuditLog {
  id: string;
  user_id: string;
  changed_by: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user_email?: string;
  changed_by_email?: string;
}

export const auditService = {
  async logAction(
    userId: string,
    action: string,
    oldValue: string | null = null,
    newValue: string | null = null
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          changed_by: user.id,
          action,
          old_value: oldValue,
          new_value: newValue,
        });

      if (error) {
        console.error('Error logging audit action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in logAction:', error);
      return false;
    }
  },

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      const logsWithEmails = await Promise.all(
        (data || []).map(async (log) => {
          const [userData, changedByData] = await Promise.all([
            supabase.auth.admin.getUserById(log.user_id),
            supabase.auth.admin.getUserById(log.changed_by),
          ]);

          return {
            ...log,
            user_email: userData.data?.user?.email || 'Unknown',
            changed_by_email: changedByData.data?.user?.email || 'Unknown',
          };
        })
      );

      return logsWithEmails;
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      return [];
    }
  },

  async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user audit logs:', error);
        return [];
      }

      const logsWithEmails = await Promise.all(
        (data || []).map(async (log) => {
          const changedByData = await supabase.auth.admin.getUserById(log.changed_by);

          return {
            ...log,
            changed_by_email: changedByData.data?.user?.email || 'Unknown',
          };
        })
      );

      return logsWithEmails;
    } catch (error) {
      console.error('Error in getUserAuditLogs:', error);
      return [];
    }
  },
};
