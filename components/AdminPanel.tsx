import React, { useEffect, useState } from 'react';
import { roleService } from '../services/roleService';
import { auditService } from '../services/auditService';
import { analyticsService } from '../services/analyticsService';
import type { UserRole, UserWithRole, AuditLog, UserAnalytics, PlatformStats, VideoStats } from '../types';
import { Shield, Users, CheckCircle, Search, Trash2, AlertCircle, X, ChevronLeft, ChevronRight, Clock, Check, Video, TrendingUp, Download } from './Icons';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedUsers, setPaginatedUsers] = useState<UserWithRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>('user');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'videos' | 'audit'>('users');
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [videos, setVideos] = useState<VideoStats[]>([]);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  useEffect(() => {
    paginateUsers();
  }, [filteredUsers, currentPage]);

  const loadData = async () => {
    setLoading(true);
    const superAdmin = await roleService.isSuperAdmin();
    setIsSuperAdmin(superAdmin);

    if (superAdmin) {
      const [allUsers, logs, stats, analytics, allVideos] = await Promise.all([
        roleService.getAllUsers(),
        auditService.getAuditLogs(50),
        analyticsService.getPlatformStats(),
        analyticsService.getAllUsersAnalytics(),
        analyticsService.getAllVideos(100),
      ]);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setAuditLogs(logs);
      setPlatformStats(stats);
      setUserAnalytics(analytics);
      setVideos(allVideos);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const paginateUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    const success = await roleService.updateUserRole(userId, newRole);

    if (success) {
      setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      const logs = await auditService.getAuditLogs(50);
      setAuditLogs(logs);
    } else {
      alert('Failed to update role');
    }

    setUpdating(null);
  };

  const handleDeleteClick = (user: UserWithRole) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    const success = await roleService.deleteUser(userToDelete.user_id);

    if (success) {
      setUsers(users.filter(u => u.user_id !== userToDelete.user_id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
      const logs = await auditService.getAuditLogs(50);
      setAuditLogs(logs);
    } else {
      alert('Failed to delete user');
    }

    setDeleting(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.user_id)));
    }
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.size === 0) return;

    setBulkUpdating(true);
    const updatePromises = Array.from(selectedUsers).map(userId =>
      roleService.updateUserRole(userId, bulkRole)
    );

    await Promise.all(updatePromises);

    const [allUsers, logs] = await Promise.all([
      roleService.getAllUsers(),
      auditService.getAuditLogs(50),
    ]);
    setUsers(allUsers);
    setAuditLogs(logs);
    setSelectedUsers(new Set());
    setBulkUpdating(false);
  };

  const handleExportData = async () => {
    setExportingData(true);
    const csvContent = await analyticsService.exportUsersToCSV();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setExportingData(false);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    const success = await analyticsService.deleteVideo(videoId);
    if (success) {
      setVideos(videos.filter(v => v.id !== videoId));
    } else {
      alert('Failed to delete video');
    }
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card rounded-xl p-6">
              <Users className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{platformStats?.total_users || users.length}</p>
              <p className="text-slate-400 text-sm">Total Users</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <Video className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">{platformStats?.total_videos || 0}</p>
              <p className="text-slate-400 text-sm">Videos Generated</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-teal-400 mb-2" />
              <p className="text-2xl font-bold text-white">{platformStats?.new_users_7d || 0}</p>
              <p className="text-slate-400 text-sm">New Users (7d)</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{platformStats?.active_users_7d || 0}</p>
              <p className="text-slate-400 text-sm">Active Users (7d)</p>
            </div>
          </div>

          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Logs
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
        <div className="glass-card rounded-2xl p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <button
              onClick={handleExportData}
              disabled={exportingData}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {exportingData ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export CSV
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-700 hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                className="bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="superadmin">Superadmins</option>
              </select>
            </div>

            {selectedUsers.size > 0 && (
              <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-white font-medium">
                    {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                  </span>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value as UserRole)}
                    className="bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkRoleUpdate}
                    disabled={bulkUpdating}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {bulkUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Update Roles
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedUsers(new Set())}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Email</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Role</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Change Role</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.user_id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.user_id)}
                        onChange={() => handleSelectUser(user.user_id)}
                        className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
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
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                        title="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No users match your search criteria</p>
            </div>
          )}

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No users found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
              <div className="text-slate-400 text-sm">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {activeTab === 'analytics' && (
        <div className="glass-card rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">User Analytics</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Email</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Role</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Videos</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Contacts</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Campaigns</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Last Login</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {userAnalytics.map((user) => (
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
                    <td className="py-4 px-4 text-slate-300">{user.video_count}</td>
                    <td className="py-4 px-4 text-slate-300">{user.contact_count}</td>
                    <td className="py-4 px-4 text-slate-300">{user.campaign_count}</td>
                    <td className="py-4 px-4 text-slate-300 text-sm">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userAnalytics.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No analytics data available</p>
            </div>
          )}
        </div>
        )}

        {activeTab === 'videos' && (
        <div className="glass-card rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Video Management</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Title</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">User</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Duration</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Created</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-4 px-4 text-white">{video.title}</td>
                    <td className="py-4 px-4 text-slate-300">{video.user_email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        video.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : video.status === 'processing'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : video.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {video.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{video.duration}s</td>
                    <td className="py-4 px-4 text-slate-300 text-sm">
                      {new Date(video.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 flex gap-2">
                      {video.video_url && (
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors p-2 hover:bg-emerald-500/10 rounded-lg"
                          title="View video"
                        >
                          <Video className="w-5 h-5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                        title="Delete video"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No videos found</p>
            </div>
          )}
        </div>
        )}

        {activeTab === 'audit' && (
        <div className="glass-card rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Audit Log</h2>

          {(
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Date</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">User</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Action</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Change</th>
                    <th className="text-left py-4 px-4 text-slate-400 font-semibold">Changed By</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-4 px-4 text-slate-300 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-white">{log.user_email}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          log.action === 'user_delete'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {log.action === 'role_update' ? 'Role Update' : 'User Delete'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {log.action === 'role_update' && (
                          <span>
                            <span className="text-slate-400">{log.old_value}</span>
                            {' → '}
                            <span className="text-emerald-400">{log.new_value}</span>
                          </span>
                        )}
                        {log.action === 'user_delete' && (
                          <span className="text-red-400">Deleted</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-300">{log.changed_by_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {auditLogs.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No audit logs found</p>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={handleDeleteCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete User</h3>
                <p className="text-slate-400 text-sm">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white mb-2">Are you sure you want to delete this user?</p>
              <div className="glass-card rounded-lg p-4 mt-3">
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white font-medium">{userToDelete.email}</p>
                <p className="text-sm text-slate-400 mt-2">Role</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  userToDelete.role === 'superadmin'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : userToDelete.role === 'admin'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {userToDelete.role}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
