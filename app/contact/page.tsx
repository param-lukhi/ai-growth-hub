'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Failed to submit form. Please try again later.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-white dark:bg-neutral-950">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 dark:text-brand-400">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Contact TechPulse
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-base max-w-xl mx-auto leading-relaxed">
          Have feedback on a review, a question about a product comparison, or an editorial inquiry? Send our team a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Editorial Inquiries</h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We welcome reader suggestions, corrections, and general feedback regarding our buying guides and product research.
            </p>

            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Email Address</span>
                  <span className="font-bold text-xs sm:text-sm">editorial@techpulsereviews.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Response Time</span>
                  <span className="font-bold text-xs sm:text-sm">Typically within 1–2 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl font-bold shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xl">Message Received!</h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto">
              Thank you for contacting TechPulse. Our editorial team will review your inquiry and follow up if needed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-50 dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                placeholder="e.g. Alex Rivera"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                placeholder="Product suggestion, question, or feedback"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                placeholder="Write your message here..."
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
