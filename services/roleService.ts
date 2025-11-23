import { supabase } from './supabase';
import { auditService } from './auditService';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export const roleService = {
  async getUserRole(userId?: string): Promise<UserRole> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

      if (!targetUserId) {
        return 'user';
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }

      return data?.role || 'user';
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return 'user';
    }
  },

  async isAdmin(userId?: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === 'admin' || role === 'superadmin';
  },

  async isSuperAdmin(userId?: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === 'superadmin';
  },

  async getAllUsers(): Promise<Array<{ user_id: string; role: UserRole; email: string }>> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      const usersWithEmails = await Promise.all(
        (data || []).map(async (roleData) => {
          const { data: userData } = await supabase.auth.admin.getUserById(roleData.user_id);
          return {
            user_id: roleData.user_id,
            role: roleData.role,
            email: userData?.user?.email || 'Unknown',
          };
        })
      );

      return usersWithEmails;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      const isSuperAdmin = await this.isSuperAdmin();
      if (!isSuperAdmin) {
        console.error('Only superadmins can update roles');
        return false;
      }

      const { data: currentRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const oldRole = currentRoleData?.role || 'user';

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      await auditService.logAction(userId, 'role_update', oldRole, newRole);

      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  },

  async createUserRole(userId: string, role: UserRole = 'user'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        console.error('Error creating user role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createUserRole:', error);
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const isSuperAdmin = await this.isSuperAdmin();
      if (!isSuperAdmin) {
        console.error('Only superadmins can delete users');
        return false;
      }

      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const userEmail = userData?.user?.email || 'Unknown';

      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      await auditService.logAction(userId, 'user_delete', userEmail, null);

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  },
};
