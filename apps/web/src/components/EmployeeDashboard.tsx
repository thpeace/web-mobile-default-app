'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { EmployeeStats, RequestItem, RequestStatus } from '@app/types';
import { StatusBadge } from './StatusBadge';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  RefreshCw,
  Filter,
  CheckSquare,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<RequestItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empStats, reqList] = await Promise.all([
        api.getEmployeeStats(),
        api.getRequests(),
      ]);
      setStats(empStats);
      setRequests(reqList);
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: RequestStatus) => {
    try {
      setIsUpdating(true);
      await api.updateRequestStatus(taskId, { status: newStatus });
      setSelectedTask(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your task console...</p>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support & Task Console</h2>
          <p className="text-sm text-slate-500">
            View, track, and resolve assigned customer service tickets and requests.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh Tasks
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Assigned Tasks
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.assignedTasksCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total assigned queue</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Open Tasks
            </p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.openTasksCount}</p>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending or In-Progress
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tasks Resolved Today
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.tasksResolvedToday}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Logged during this shift
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Task Priority List / Kanban Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-900">Filter Work Queue:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    statusFilter === filter
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'ALL'
                    ? 'All'
                    : filter === 'PENDING'
                    ? 'Pending'
                    : filter === 'IN_PROGRESS'
                    ? 'In Progress'
                    : 'Resolved'}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredRequests.length} matching tickets
          </span>
        </div>

        {/* Task Cards */}
        <div className="divide-y divide-slate-100">
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No tasks currently match this status filter.
            </div>
          ) : (
            filteredRequests.map((task) => (
              <div
                key={task.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={task.status} />
                    <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      Client:{' '}
                      <strong className="text-slate-700">
                        {task.client?.name || task.clientId}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Received: {new Date(task.createdAt).toLocaleString()}</span>
                    {task.resolvedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">
                          Resolved: {new Date(task.resolvedAt).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== 'IN_PROGRESS' && task.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Start Task
                    </button>
                  )}

                  {task.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'RESOLVED')}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedTask(task)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <StatusBadge status={selectedTask.status} />
              <span className="text-xs text-slate-400 font-mono">ID: {selectedTask.id}</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">
                  {selectedTask.description || 'No additional description provided.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <p>
                  <strong>Client:</strong> {selectedTask.client?.name || selectedTask.clientId} (
                  {selectedTask.client?.email})
                </p>
                <p>
                  <strong>Submitted:</strong> {new Date(selectedTask.createdAt).toLocaleString()}
                </p>
                {selectedTask.resolvedAt && (
                  <p>
                    <strong>Resolved:</strong> {new Date(selectedTask.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedTask.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, 'IN_PROGRESS')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    Set In Progress
                  </button>
                )}
                {selectedTask.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, 'RESOLVED')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
