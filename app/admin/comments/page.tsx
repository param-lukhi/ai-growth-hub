'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Check, X, Trash2 } from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  email: string;
  content: string;
  status: string;
  blog?: { title: string; slug: string };
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = () => {
    setLoading(true);
    fetch('/api/comments')
      .then((res) => res.json())
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    fetchComments();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-xs uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" /> Community Moderation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          User Comments & Discussions
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Approve, edit, or remove reader comments across blog reviews.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : comments.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Author</th>
                <th className="p-4">Comment Text</th>
                <th className="p-4">Article</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-neutral-900 dark:text-white">{c.author}</div>
                    <div className="text-[10px] text-neutral-400">{c.email}</div>
                  </td>
                  <td className="p-4 text-neutral-700 dark:text-neutral-300 max-w-xs">{c.content}</td>
                  <td className="p-4 text-neutral-500 truncate max-w-[150px]">
                    {c.blog ? (
                      <a href={`/blog/${c.blog.slug}`} target="_blank" className="hover:underline text-brand-600">
                        {c.blog.title}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        c.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : c.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          title="Approve Comment"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {c.status !== 'SPAM' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'SPAM')}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
                          title="Mark as Spam"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
          <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No comments yet.</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            When visitors comment on your published reviews, they will appear here for approval.
          </p>
        </div>
      )}
    </div>
  );
}
