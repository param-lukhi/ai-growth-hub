'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = () => {
    setLoading(true);
    fetch('/api/newsletter')
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete subscriber "${email}"?`)) return;
    await fetch(`/api/newsletter/${id}`, { method: 'DELETE' });
    fetchSubscribers();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Mail className="w-4 h-4" /> Audience Engagement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Newsletter Subscribers List
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            View reader emails registered for tech deals and weekly review updates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : subscribers.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Email Address</th>
                <th className="p-4">Subscribed Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-900 dark:text-white">{s.email}</td>
                  <td className="p-4 text-neutral-500">{formatDate(s.createdAt)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase text-[10px]">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(s.id, s.email)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
          <Mail className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No subscribers yet.</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            When readers subscribe to your newsletter on the live website, their emails will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
