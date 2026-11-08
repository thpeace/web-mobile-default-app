import React from 'react';
import { Role } from '@app/types';

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const styles: Record<Role, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    EMPLOYEE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    CLIENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[role] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}
    >
      {role}
    </span>
  );
};
