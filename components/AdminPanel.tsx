import React, { useEffect, useState } from 'react';
import { roleService, UserRole } from '../services/roleService';
import { Shield, Users, CheckCircle } from './Icons';

interface UserWithRole {
  user_id: string;
  email: string;
  role: UserRole;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const superAdmin = await roleService.isSuperAdmin();
    setIsSuperAdmin(superAdmin);

    if (superAdmin) {
      const allUsers = await roleService.getAllUsers();
      setUsers(allUsers);
    }
    setLoading(false);
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    const success = await roleService.updateUserRole(userId, newRole);

    if (success) {
      setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
    } else {
      alert('Failed to update role');
    }

    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You need superadmin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400">Manage user roles and permissions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-6">
              <Users className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-slate-400 text-sm">Total Users</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <Shield className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-slate-400 text-sm">Admins</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-teal-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'superadmin').length}
              </p>
              <p className="text-slate-400 text-sm">Superadmins</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Email</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Role</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-4 px-4 text-white">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'superadmin'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : user.role === 'admin'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.user_id, e.target.value as UserRole)}
                        disabled={updating === user.user_id}
                        className="bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
