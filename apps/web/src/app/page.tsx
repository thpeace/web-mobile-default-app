'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
}
