'use client';

import { useState, useEffect } from 'react';
import { Zap, Lock } from 'lucide-react';

const PASSPHRASE = 'akshaya2026';
const STORAGE_KEY = 'vs_private_unlocked';

export default function PrivateGate({ children, pageName }: { children: React.ReactNode; pageName: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(STORAGE_KEY) === PASSPHRASE) setUnlocked(true);
  }, []);

  const handleSubmit = () => {
    if (input === PASSPHRASE) {
      sessionStorage.setItem(STORAGE_KEY, PASSPHRASE);
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  if (!mounted) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 max-w-sm w-full space-y-5 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">VoltSpark</h1>
        </div>
        <div className="flex items-center gap-2 justify-center text-gray-500 dark:text-gray-400">
          <Lock className="h-4 w-4" />
          <p className="text-sm">{pageName} — Private</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This page is shared privately. Enter the passphrase from your WhatsApp message to continue.
        </p>
        <div className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-center text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Enter passphrase"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs">Incorrect passphrase. Check your WhatsApp message.</p>}
          <button
            onClick={handleSubmit}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            Continue
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Don&apos;t have access? <a href="https://wa.me/918317308558?text=Hi%2C+I+would+like+access+to+VoltSpark+private+pages" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Request via WhatsApp</a>
        </p>
      </div>
    </div>
  );
}
