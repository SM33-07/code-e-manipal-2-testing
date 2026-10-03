'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useTheme } from 'next-themes';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'judge' | 'participant';
  identifier?: string;
  is_disabled: boolean;
  force_logout_before?: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  target_id?: string;
  target_table?: string;
  details: any;
  created_at: string;
  actor_name?: string;
  actor_email?: string;
}

export default function AdminUsersPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modals & Active state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ password: string; user: Profile } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Bulk Generator State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRole, setBulkRole] = useState<'participant' | 'judge'>('participant');
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPrefix, setBulkPrefix] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState<any[] | null>(null);

  // Audit Logs
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setProfiles(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (user: Profile) => {
    if (!confirm(`Are you sure you want to reset password and invalidate all active sessions for ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin one-click reset' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');

      setResetPasswordResult({
        password: data.data.temporary_password,
        user,
      });
      setSuccessMsg(`Password successfully reset for ${user.email}.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleForceLogout = async (user: Profile) => {
    if (!confirm(`Force logout will immediately terminate all active sessions for ${user.name}. Continue?`)) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setError(null);
      const res = await fetch(`/api/admin/users/${user.id}/force-logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin manual revocation' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Force logout failed');

      setSuccessMsg(`All active sessions revoked for ${user.email}.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggleDisable = async (user: Profile) => {
    const actionWord = user.is_disabled ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${actionWord} account for ${user.name}?`)) {
      return;
    }

    try {
      setError(null);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-disable',
          user_id: user.id,
          is_disabled: !user.is_disabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');

      setSuccessMsg(`Account ${actionWord}d successfully.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (user: Profile, newRole: string) => {
    try {
      setError(null);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Role change failed');

      setSuccessMsg(`Role updated to ${newRole} for ${user.email}.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkGenerate = async (downloadCsv = false) => {
    try {
      setIsGenerating(true);
      setError(null);

      if (downloadCsv) {
        const res = await fetch('/api/admin/users/bulk-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: bulkRole,
            count: bulkCount,
            prefix: bulkPrefix || undefined,
            format: 'csv',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'CSV generation failed');
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `badges-${bulkRole}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setSuccessMsg(`Downloaded badge credentials CSV for ${bulkCount} ${bulkRole}s.`);
        setShowBulkModal(false);
        fetchUsers();
      } else {
        const res = await fetch('/api/admin/users/bulk-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: bulkRole,
            count: bulkCount,
            prefix: bulkPrefix || undefined,
            format: 'json',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Bulk generation failed');

        setBulkResult(data.data);
        setSuccessMsg(`Generated ${data.data.length} credentials successfully.`);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await fetch('/api/admin/users?audit=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load audit logs');
      setAuditLogs(data.data || []);
      setShowAuditModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !p.is_disabled) ||
      (statusFilter === 'disabled' && p.is_disabled);
    const matchesSearch =
      searchQuery === '' ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.identifier?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const totalUsers = profiles.length;
  const adminCount = profiles.filter((p) => p.role === 'admin').length;
  const judgeCount = profiles.filter((p) => p.role === 'judge').length;
  const participantCount = profiles.filter((p) => p.role === 'participant').length;
  const disabledCount = profiles.filter((p) => p.is_disabled).length;

  return (
    <div className="space-y-6">
      {/* Title & Action Dock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Admin Governance & Credential Issuance</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADR-001 / ADR-010
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Bulk event provisioning, credential generation, session invalidation, and badge CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchAuditLogs()}
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-sm font-medium transition flex items-center gap-1.5"
          >
            <span>📜</span>
            <span>Audit Log</span>
          </button>

          <button
            onClick={() => {
              setBulkResult(null);
              setShowBulkModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm shadow-lg shadow-amber-900/30 transition flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Bulk Credentials</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200 text-sm flex items-center justify-between">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className="text-xs underline text-red-300">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline text-emerald-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-medium text-gray-400">Total Users</div>
          <div className="text-2xl font-bold text-white mt-1">{totalUsers}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-medium text-gray-400">Participants</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{participantCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-medium text-gray-400">Judges</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{judgeCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-medium text-gray-400">Admins</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{adminCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-medium text-gray-400">Disabled</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{disabledCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or badge ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50"
          />
          <span className="absolute left-3 top-2 text-xs text-gray-500">🔍</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-300 text-sm focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="participant">Participants</option>
            <option value="judge">Judges</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-300 text-sm focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-sm transition"
            title="Refresh Users"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/[0.04] text-xs font-semibold uppercase text-gray-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Identifier / Badge</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No users found matching filters.
                </td>
              </tr>
            ) : (
              filteredProfiles.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.name || 'Unnamed'}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded border focus:outline-none ${
                        user.role === 'admin'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          : user.role === 'judge'
                          ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                          : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      <option value="participant">Participant</option>
                      <option value="judge">Judge</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                      {user.identifier || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.is_disabled
                          ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {user.is_disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={isResetting}
                        className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition"
                        title="Reset password and invalidate sessions"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => handleForceLogout(user)}
                        disabled={isLoggingOut}
                        className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 transition"
                        title="Force logout and revoke sessions"
                      >
                        Kick
                      </button>
                      <button
                        onClick={() => handleToggleDisable(user)}
                        className={`px-2.5 py-1 text-xs rounded border transition ${
                          user.is_disabled
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/60'
                            : 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-950/60'
                        }`}
                      >
                        {user.is_disabled ? 'Enable' : 'Disable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Password Reset Result Modal */}
      {resetPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121114] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔐 Temporary Password Generated</span>
            </h3>
            <p className="text-xs text-amber-400/90 bg-amber-500/10 p-3 rounded border border-amber-500/20">
              <strong>Notice:</strong> Zero Plaintext Persistence. This password will never be shown again and is not stored in plaintext in the database.
            </p>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">User Email</label>
              <div className="text-sm font-medium text-white">{resetPasswordResult.user.email}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Temporary Password</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resetPasswordResult.password}
                  className="font-mono text-lg font-bold bg-black/60 border border-white/20 px-3 py-2 rounded text-amber-300 w-full"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetPasswordResult.password);
                    alert('Password copied to clipboard!');
                  }}
                  className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setResetPasswordResult(null)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generator Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121114] border border-white/20 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡ Bulk Credential Generator & Badge Export</span>
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-blue-950/30 border border-blue-500/20 text-blue-200 text-xs leading-relaxed">
              <strong>Strict Separation of Admin Accounts (Baseline Line 603):</strong> The bulk generator produces 6-character credentials strictly for participants and judges. Administrative accounts must be provisioned individually with 16+ character high-entropy credentials.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Target Role</label>
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-white/10 text-white text-sm"
                >
                  <option value="participant">Participant</option>
                  <option value="judge">Judge</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Quantity (1–100)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Prefix (Optional)</label>
              <input
                type="text"
                placeholder={bulkRole === 'judge' ? 'JUDGE' : 'TEAM'}
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
                className="w-full px-3 py-2 rounded bg-black/60 border border-white/10 text-white text-sm"
              />
            </div>

            {bulkResult && (
              <div className="mt-3 p-3 rounded bg-black/40 border border-white/10 max-h-48 overflow-y-auto space-y-1">
                <div className="text-xs font-semibold text-gray-400 mb-2">
                  Generated {bulkResult.length} Credentials:
                </div>
                {bulkResult.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono text-gray-300">
                    <span>{c.email}</span>
                    <span className="text-amber-400 font-bold">{c.password}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkGenerate(false)}
                disabled={isGenerating}
                className="px-4 py-2 rounded bg-white/20 hover:bg-white/30 text-white text-sm font-medium"
              >
                {isGenerating ? 'Generating...' : 'Preview in Console'}
              </button>
              <button
                onClick={() => handleBulkGenerate(true)}
                disabled={isGenerating}
                className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium"
              >
                {isGenerating ? 'Exporting...' : 'Export Badge CSV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Viewer Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121114] border border-white/20 rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📜 Security Audit Logs (Append-Only)</span>
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-white/5 pr-1">
              {loadingAudit ? (
                <div className="p-8 text-center text-gray-500">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No audit events recorded.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400">{log.action}</span>
                      <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Actor: <span className="text-white">{log.actor_email || log.user_id}</span>
                    </div>
                    {log.details && (
                      <pre className="text-[11px] font-mono text-gray-500 bg-black/40 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
