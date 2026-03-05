// app/request-access/RequestAccessButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  auth0Sub: string;
  email: string;
  name: string;
}

export default function RequestAccessButton({ auth0Sub, email, name }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleRequest() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sso/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_sub: auth0Sub,
          email,
          full_name: name,
          role: 'student',
          status: 'pending',
          school_id: null,
          member_state_id: null,
          grades_csv: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitted(true);
      setTimeout(() => router.refresh(), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm">
        ✓ Request submitted! An admin will review your request shortly.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
      )}
      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Access
          </>
        )}
      </button>
    </div>
  );
}
