'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-100 mb-3">
            <Zap className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">We&apos;ll email you a link to set a new password</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">Check your email</p>
              <p className="text-xs text-green-700 mt-1">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a reset link shortly. It expires in 1 hour.
              </p>
            </div>
            <Link href="/login" className="btn-secondary w-full flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading || !email} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <Link href="/login" className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
