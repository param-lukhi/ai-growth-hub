'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

interface CommentItem {
  id: string;
  name: string;
  comment: string;
  date: string;
}

export default function CommentsSection() {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: '1',
      name: 'David Miller',
      comment: 'Excellent, detailed review! I bought the iPhone 15 Pro Max based on your camera benchmark tests and it exceeded expectations.',
      date: '2 days ago',
    },
    {
      id: '2',
      name: 'Sarah Jenkins',
      comment: 'How does the battery life compare to the previous generation after 6 months of daily use?',
      date: '1 day ago',
    },
  ]);

  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      name: name.trim(),
      comment: commentText.trim(),
      date: 'Just now',
    };

    setComments([newComment, ...comments]);
    setName('');
    setCommentText('');
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm my-10 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          Community Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            required
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <textarea
            required
            rows={3}
            placeholder="Share your opinion or ask a question about this product..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>Post Comment</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-center text-xs">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white">{c.name}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">{c.date}</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pl-9">
              {c.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
