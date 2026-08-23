'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Send, CheckCircle2, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Subscription failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categoriesList = [
    { name: 'Mobiles', slug: 'mobiles' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'TVs', slug: 'tvs' },
    { name: 'Audio & Earbuds', slug: 'earbuds' },
    { name: 'Smart Watches', slug: 'smart-watches' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
  ];

  const topReviews = [
    { title: 'Apple iPhone 15 Pro Max Review', href: '/blog/apple-iphone-15-pro-max-review' },
    { title: 'Sony WH-1000XM5 Noise Canceling', href: '/blog/sony-wh-1000xm5-noise-canceling-headphones' },
    { title: 'MacBook Air M3 15" Deep Dive', href: '/blog/apple-macbook-air-m3-15-inch' },
  ];

  return (
    <footer className="bg-neutral-950 text-neutral-400 text-sm border-t border-neutral-800/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amazon-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand & Newsletter */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
                T
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Tech<span className="text-brand-500">Pulse</span>
              </span>
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Research-based product reviews, specification comparisons, and curated tech buying guides across regional marketplaces.
            </p>

            {/* Newsletter Subscription Form */}
            <div className="pt-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-500" /> Subscribe to Deals & Reviews
              </h4>
              {subscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed! You will receive weekly tech deals and buying guides.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2 max-w-sm">
                  <div className="flex flex-col xs:flex-row gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder-neutral-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shrink-0 transition-all flex items-center justify-center gap-1 shadow-md shadow-brand-600/20 disabled:opacity-60"
                    >
                      <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 font-medium">{errorMsg}</p>
                  )}
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a href="#" className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-brand-600/20 hover:border-brand-500/40 transition-all duration-300 hover:scale-105">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-brand-600/20 hover:border-brand-500/40 transition-all duration-300 hover:scale-105">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-brand-600/20 hover:border-brand-500/40 transition-all duration-300 hover:scale-105">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-brand-600/20 hover:border-brand-500/40 transition-all duration-300 hover:scale-105">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {categoriesList.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Top Reviews & Deals */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Top Reviews & Deals
            </h3>
            <ul className="space-y-2 text-xs">
              {topReviews.map((rev, i) => (
                <li key={i}>
                  <Link href={rev.href} className="hover:text-white hover:translate-x-0.5 transition-all line-clamp-1 inline-block">
                    {rev.title}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/deals" className="inline-flex items-center gap-1 text-amazon-orange font-bold hover:text-amber-400 transition-colors">
                  🔥 Latest Amazon Deals
                </Link>
              </li>
              <li>
                <Link href="/comparisons" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                  ⚖️ Head-to-Head Comparisons
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Company & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">Terms & Conditions</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">Affiliate Disclosure</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">Cookie Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Amazon Affiliate Disclosure Banner */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 text-xs text-neutral-300/90 leading-relaxed mb-8 shadow-inner backdrop-blur-xs relative overflow-hidden hover:border-neutral-700/80 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amazon-orange to-brand-500" />
          <strong className="text-white font-bold">Amazon Affiliate Disclosure:</strong> TechPulse is a participant in the Amazon Services LLC Associates Program and regional Amazon affiliate programs worldwide. As an Amazon Associate, we earn from qualifying purchases. Product prices, availability, and promotions are accurate as of the date/time indicated and are subject to change.
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} TechPulse Reviews. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
