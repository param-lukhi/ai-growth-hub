'use client';

import React from 'react';
import { useTheme } from '@/lib/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-600 animate-in fade-in zoom-in duration-200" />
      )}
    </button>
  );
}
