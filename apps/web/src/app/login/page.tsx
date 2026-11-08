'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@app/validation';
import { Layers, ShieldCheck, UserCheck, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors.map((e) => e.message).join(', '));
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT') => {
    if (role === 'ADMIN') {
      setEmail('admin@example.com');
      setPassword('password123');
    } else if (role === 'EMPLOYEE') {
      setEmail('employee@example.com');
      setPassword('password123');
    } else if (role === 'CLIENT') {
      setEmail('client@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Hero / Branding Panel (Split Screen Layout) */}
      <div className="md:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CrossPlatform Suite</h1>
              <p className="text-xs text-blue-300 font-medium">Enterprise Web & Mobile Hub</p>
            </div>
          </div>

          <div className="mt-16 md:mt-24 space-y-4 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" /> Unified Monorepo Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              One central backend, shared types, dual frontends.
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Desktop-optimized Next.js web application paired with native Expo mobile app.
              Enforcing rigorous Role-Based Access Control (Admin, Employee, Client).
            </p>
          </div>
        </div>

        {/* Demo Fast-Fill Buttons */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setDemoCredentials('ADMIN')}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5" /> ADMIN
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">admin@example.com</p>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('EMPLOYEE')}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <UserCheck className="w-3.5 h-3.5" /> EMPLOYEE
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">employee@example.com</p>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('CLIENT')}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <User className="w-3.5 h-3.5" /> CLIENT
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">client@example.com</p>
            </button>
          </div>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="md:w-1/2 p-8 md:p-14 flex items-center justify-center bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/40">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to access your personalized role dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-xs text-slate-400">Default: password123</span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-[1.005]"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Authentication secured via JWT and Argon2/Bcrypt hash verification.
          </p>
        </div>
      </div>
    </div>
  );
}
