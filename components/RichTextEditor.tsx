'use client';

import React, { useRef, useState } from 'react';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Table as TableIcon, Image as ImageIcon, Link as LinkIcon,
  Code, Sparkles, Eye, Edit3
} from 'lucide-react';
import { parseMarkdownToHtml } from '@/lib/markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'Sample text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  const insertProductTable = () => {
    const tableSnippet = `
| Feature | Details / Specification |
| ------- | ----------------------- |
| Brand & Model | HP OmniBook 5 OLED (2026) |
| Processor | Qualcomm Snapdragon X Plus (8 Cores) |
| RAM & Storage | 16GB LPDDR5x | 512GB NVMe SSD |
| Display | 14-inch 2K OLED (1920x1200) |
`;
    insertFormatting(tableSnippet);
  };

  return (
    <div className="border border-neutral-300 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm space-y-0">
      {/* Editor Header Mode Switcher & Formatting Bar */}
      <div className="bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('\n## ', '\n')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Heading 2 (## Heading)"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('\n### ', '\n')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Heading 3 (### Heading)"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('\n* ', '\n')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Bullet List (* Item)"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('\n1. ', '\n')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Numbered List (1. Item)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('[', '](https://amazon.com)')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Insert Link ([text](url))"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('![Image Alt](', ')')}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Insert Image (![alt](url))"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={insertProductTable}
            className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 flex items-center gap-1"
            title="Insert Markdown Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              activeTab === 'editor'
                ? 'bg-brand-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              activeTab === 'preview'
                ? 'bg-brand-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === 'editor' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full p-4 text-sm font-mono text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 outline-none resize-y leading-relaxed"
          placeholder="Paste or write blog content here (Markdown or HTML)..."
        />
      ) : (
        <div className="p-6 bg-white dark:bg-neutral-900 min-h-[380px] max-h-[600px] overflow-y-auto border-t border-neutral-100 dark:border-neutral-800">
          <div
            className="prose dark:prose-invert max-w-none font-sans leading-relaxed text-neutral-800 dark:text-neutral-200"
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(value || '*No content entered yet.*') }}
          />
        </div>
      )}
    </div>
  );
}

