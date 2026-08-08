'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';

export default function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to audit website');
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`siteaudit-ai:audit:${data.id}`, JSON.stringify(data));
        window.localStorage.setItem('siteaudit-ai:recent-audits', JSON.stringify([data.id]));
      }

      // Navigate to audit result page
      router.push(`/audit/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-navy-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="sm:w-48 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Auditing...
            </>
          ) : (
            'Audit Website'
          )}
        </button>
      </div>
      <p className="text-center mt-3 text-navy-600 text-sm">
        <span className="font-medium">Free. No account required.</span>
      </p>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
