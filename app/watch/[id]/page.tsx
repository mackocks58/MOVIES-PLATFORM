'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Play, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useUserPayments } from '@/lib/use-payments';
import { db, ref, onValue, off } from '@/lib/firebase';
import type { Movie } from '@/lib/db-types';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { hasPaid, loading: paymentsLoading } = useUserPayments(user?.uid);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const paid = hasPaid(id);

  useEffect(() => {
    if (!id) return;
    const movieRef = ref(db, `movies/${id}`);
    const unsub = onValue(movieRef, (snapshot) => {
      const data = snapshot.val();
      setMovie(data ? { ...data, id } : null);
      setLoading(false);
    });
    return () => off(movieRef);
  }, [id]);

  const handlePayment = useCallback(async () => {
    if (!user || !movie) return;
    setPayError('');
    setPaying(true);
    try {
      const res = await fetch('/api/selcom/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          amount: movie.price || 2000,
          userId: user.uid,
          buyerEmail: form.email || user.email,
          buyerName: form.name || user.displayName || 'Customer',
          buyerPhone: form.phone || '255700000000',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (e) {
      setPayError((e as Error).message);
    } finally {
      setPaying(false);
    }
  }, [user, movie, form]);

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

  const poster = movie.posterUrl || `https://placehold.co/1280x720/1a1a1a/eb751d?text=${encodeURIComponent(movie.title)}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to movies
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden bg-dark-900/80 border border-dark-700/50"
      >
        <div className="aspect-video relative bg-dark-900">
          {paid ? (
            <video
              key={movie.videoUrl}
              src={movie.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              poster={poster}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${poster})` }}
              />
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-8">
                <Lock className="w-20 h-20 text-brand-500 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Unlock to watch</h2>
                <p className="text-dark-300 mb-6 text-center max-w-md">{movie.title}</p>
                <p className="text-brand-400 font-semibold text-xl mb-8">
                  TZS {movie.price?.toLocaleString()} • Pay once, watch forever
                </p>

                {!user ? (
                  <Link
                    href={`/login?redirect=/watch/${id}`}
                    className="px-8 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
                  >
                    Sign in to pay
                  </Link>
                ) : (
                  <div className="w-full max-w-sm space-y-4">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-dark-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-dark-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (255712345678)"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-dark-500"
                    />
                    {payError && <p className="text-red-400 text-sm">{payError}</p>}
                    <button
                      onClick={handlePayment}
                      disabled={paying || !form.phone || !form.email}
                      className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {paying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Redirecting to payment...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Pay TZS {movie.price?.toLocaleString()} to unlock
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
          <p className="text-dark-400 text-sm mb-4">{movie.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-dark-700 text-dark-300 text-sm">{movie.category}</span>
            {movie.releaseYear && (
              <span className="px-3 py-1 rounded-full bg-dark-700 text-dark-300 text-sm">{movie.releaseYear}</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
