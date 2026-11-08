'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ClientStats, RequestItem } from '@app/types';
import { StatusBadge } from './StatusBadge';
import { createRequestSchema } from '@app/validation';
import {
  PlusCircle,
  Clock,
  Archive,
  RefreshCw,
  Send,
  HelpCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientStats, reqList] = await Promise.all([
        api.getClientStats(),
        api.getRequests(),
      ]);
      setStats(clientStats);
      setRequests(reqList);
    } catch (err) {
      console.error('Failed to load client data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = createRequestSchema.safeParse({
      title: newTitle,
      description: newDescription || undefined,
    });

    if (!validation.success) {
      setFormError(validation.error.errors.map((e) => e.message).join(', '));
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createRequest({
        title: newTitle,
        description: newDescription || undefined,
      });
      setNewTitle('');
      setNewDescription('');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your service portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Large "Create New Request" Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Client Service Hub</h2>
          <p className="text-sm text-slate-500">
            Submit service tickets, monitor resolution progress, and review request history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Request
          </button>
        </div>
      </div>

      {/* 2 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Open Requests
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.openRequestsCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Currently in processing queue</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Historical Requests
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {stats.totalHistoricalRequestsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Lifetime tickets submitted</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Archive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Status Tracking: Requests Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submitted Requests & Status Tracking</h3>
            <p className="text-xs text-slate-500">Live operational status updates for all your requests</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {requests.length} Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Request Title & Summary</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Assigned Specialist</th>
                <th className="py-3.5 px-6">Submitted At</th>
                <th className="py-3.5 px-6">Resolution Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    You haven't submitted any service requests yet. Click "Create New Request" above!
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{req.title}</p>
                      {req.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">
                          {req.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs">
                      {req.employee ? (
                        <span className="font-medium text-slate-800">{req.employee.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Queue Pending</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                      {req.resolvedAt ? (
                        <span className="font-semibold text-emerald-700">
                          {new Date(req.resolvedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Service Request</h3>
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

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Request Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server storage capacity expansion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide context, error messages, or requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
