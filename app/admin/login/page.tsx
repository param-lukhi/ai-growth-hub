'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-900 text-white">
      <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="text-xs text-neutral-400">
            Sign in to manage blogs, products, settings, and analytics.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                autoComplete="off"
                name="admin_email_input"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm outline-none focus:border-brand-500"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="new-password"
                name="admin_password_input"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-700 text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected Administrator Session</span>
        </div>
      </div>
    </div>
  );
}
