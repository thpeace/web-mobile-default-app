'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AdminStats, User, RequestItem } from '@app/types';
import { StatusBadge } from './StatusBadge';
import { RoleBadge } from './RoleBadge';
import {
  Users,
  AlertCircle,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  UserCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningRequest, setAssigningRequest] = useState<RequestItem | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [adminStats, usersList] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(undefined, 'EMPLOYEE'),
      ]);
      setStats(adminStats);
      setEmployees(usersList);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRequest) return;
    try {
      setIsUpdating(true);
      await api.assignRequest(assigningRequest.id, {
        employeeId: selectedEmployeeId || null,
      });
      setAssigningRequest(null);
      await loadData();
    } catch (err) {
      console.error('Failed to assign task:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading administrative metrics...</p>
        </div>
      </div>
    );
  }

  // Format minutes into hours/minutes
  const formatResolutionTime = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  };

  // Recent 14 days for compact chart display
  const chartDays = stats.createdVsResolved30Days.slice(-14);
  const maxDayCount = Math.max(
    ...chartDays.map((d) => Math.max(d.created, d.resolved)),
    4
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Overview</h2>
          <p className="text-sm text-slate-500">
            System performance KPIs, request pipeline, and operational resolution tracking.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh Metrics
        </button>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Active Clients
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalActiveClients}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Provisioned in directory
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unassigned Pending Requests
            </p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {stats.unassignedPendingRequests}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Requires employee triage
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Resolution Time (KPI)
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {formatResolutionTime(stats.averageResolutionTimeMinutes)}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Based on completed SLAs
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Section: Created vs Resolved */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Request Throughput Trend</h3>
            <p className="text-xs text-slate-500">
              New client submissions vs. resolved issues over the past 14 days
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" /> Created
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Resolved
            </span>
          </div>
        </div>

        {/* Visual Bar Chart Representation */}
        <div className="grid grid-cols-14 gap-2 h-44 items-end pt-4">
          {chartDays.map((d, index) => {
            const createdHeight = `${Math.min(100, Math.max(8, (d.created / maxDayCount) * 100))}%`;
            const resolvedHeight = `${Math.min(100, Math.max(8, (d.resolved / maxDayCount) * 100))}%`;
            const dayLabel = d.date.slice(5);

            return (
              <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                <div className="w-full flex justify-center gap-1 items-end h-32 mb-2">
                  <div
                    style={{ height: d.created > 0 ? createdHeight : '4px' }}
                    className={`w-2.5 rounded-t transition-all ${
                      d.created > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-slate-100'
                    }`}
                    title={`Created on ${d.date}: ${d.created}`}
                  />
                  <div
                    style={{ height: d.resolved > 0 ? resolvedHeight : '4px' }}
                    className={`w-2.5 rounded-t transition-all ${
                      d.resolved > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-100'
                    }`}
                    title={`Resolved on ${d.date}: ${d.resolved}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight transform -rotate-45 sm:rotate-0">
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Enterprise Activity</h3>
            <p className="text-xs text-slate-500">Live feed of all customer requests across teams</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {stats.totalRequests} Total Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recentActivity.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No recent activity recorded.</p>
          ) : (
            stats.recentActivity.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={req.status} />
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{req.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      Client: <strong className="text-slate-700">{req.client?.name || req.clientId}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Assigned:{' '}
                      <strong className="text-slate-700">
                        {req.employee?.name || 'Unassigned'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssigningRequest(req);
                      setSelectedEmployeeId(req.employeeId || '');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign Employee
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Assign Employee */}
      {assigningRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">Assign Request to Employee</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Task: {assigningRequest.title}
            </p>

            <form onSubmit={handleAssign} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Unassigned --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningRequest(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  {isUpdating ? 'Saving...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
