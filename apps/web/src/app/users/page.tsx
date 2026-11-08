'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Role } from '@app/types';
import { RoleBadge } from '@/components/RoleBadge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { createUserSchema } from '@app/validation';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('CLIENT');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (currentUser.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [currentUser, authLoading, router]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers(searchTerm || undefined, roleFilter || undefined);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      loadUsers();
    }
  }, [currentUser, searchTerm, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = createUserSchema.safeParse({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
    });

    if (!validation.success) {
      setFormError(validation.error.errors.map((e) => e.message).join(', '));
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });

      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('CLIENT');
      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await api.deleteUser(userId);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  if (authLoading || !currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Pagination calculation
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  User Management
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Admin control: Provision accounts, assign enterprise roles, and manage access
                rights.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadUsers}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                Refresh
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
              >
                <UserPlus className="w-4 h-4" />
                Add New User
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Name & Identifier</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Assigned Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created At</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading user directory...
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No users found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{u.name}</p>
                              <p className="text-[11px] font-mono text-slate-400">{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{u.email}</td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          {u.id !== currentUser.id ? (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Self</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {currentPage} of {totalPages} ({users.length} total users)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Add User Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Provision New User</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Dropdown *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="CLIENT">CLIENT (End-user service requests)</option>
                  <option value="EMPLOYEE">EMPLOYEE (Fulfillment & ticket resolution)</option>
                  <option value="ADMIN">ADMIN (Full management & system access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
