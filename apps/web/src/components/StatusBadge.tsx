import React from 'react';
import { RequestStatus } from '@app/types';

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const styles: Record<RequestStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels: Record<RequestStatus, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CANCELLED: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status === 'PENDING'
            ? 'bg-amber-500'
            : status === 'IN_PROGRESS'
            ? 'bg-blue-500'
            : status === 'RESOLVED'
            ? 'bg-emerald-500'
            : 'bg-slate-400'
        }`}
      />
      {labels[status] || status}
    </span>
  );
};

