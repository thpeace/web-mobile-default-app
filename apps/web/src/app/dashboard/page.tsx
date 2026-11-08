'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AdminDashboard } from '@/components/AdminDashboard';
import { EmployeeDashboard } from '@/components/EmployeeDashboard';
import { ClientDashboard } from '@/components/ClientDashboard';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Checking session authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Dynamic dashboard rendered according to user role */}
          {user.role === 'ADMIN' && <AdminDashboard />}
          {user.role === 'EMPLOYEE' && <EmployeeDashboard />}
          {user.role === 'CLIENT' && <ClientDashboard />}
        </div>
      </main>
    </div>
  );
}
