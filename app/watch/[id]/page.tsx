'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Play, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useUserPayments } from '@/lib/use-payments';
import { db, ref, onValue, off } from '@/lib/firebase';
import type { Movie } from '@/lib/db-types';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { hasPaid, credits, unlockMovieWithCredits, loading: paymentsLoading } = useUserPayments(user?.uid);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

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

  const handleUnlock = async () => {
    if (!user || !movie) return;
    setUnlocking(true);
    setMsg({ text: '', type: '' });
    
    const res = await unlockMovieWithCredits(id);
    if (!res.success) {
      setMsg({ text: res.error || 'Failed to unlock', type: 'error' });
    } else {
      setMsg({ text: 'Movie unlocked successfully!', type: 'success' });
    }
    setUnlocking(false);
  };

  const handleBuyCredits = async () => {
    if (!user || !movie) return;
    setMsg({ text: '', type: '' });
    setBuying(true);
    try {
      const res = await fetch('/api/selcom/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: 'credits',
          movieTitle: '10 Movie Credits Bundle',
          amount: 2000,
          userId: user.uid,
          buyerEmail: user.email,
          buyerName: user.displayName || 'Customer',
          buyerPhone: '255700000000',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      if (data.paymentUrl) window.location.href = data.paymentUrl;
    } catch (e) {
      setMsg({ text: (e as Error).message, type: 'error' });
    } finally {
      setBuying(false);
    }
  };

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
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors font-medium group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[2rem] overflow-hidden bg-dark-900 border border-dark-800 shadow-2xl"
      >
        <div className="aspect-video relative bg-black">
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
                className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-30"
                style={{ backgroundImage: `url(${poster})` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                   <Lock className="w-10 h-10 text-brand-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Access Restricted</h2>
                <p className="text-dark-400 mb-8 text-center max-w-md">The requested movie <strong>{movie.title}</strong> is currently locked. Use 1 credit to watch.</p>

                {!user ? (
                  <Link
                    href={`/login?redirect=/watch/${id}`}
                    className="px-10 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black transition-all shadow-xl shadow-brand-500/30"
                  >
                    Sign in to Unlock
                  </Link>
                ) : (
                  <div className="w-full max-w-md flex flex-col items-center">
                    <div className="w-full p-6 rounded-3xl bg-dark-800/80 border border-dark-700 backdrop-blur-md mb-6">
                      <div className="flex items-center justify-between mb-6">
                         <span className="text-dark-400 font-medium">Your Credit Balance</span>
                         <span className="text-2xl font-black text-white">{credits} <span className="text-brand-500 text-sm">Credits</span></span>
                      </div>
                      
                      {credits > 0 ? (
                        <button
                          onClick={handleUnlock}
                          disabled={unlocking}
                          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                        >
                          {unlocking ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Play className="w-6 h-6 fill-white" /> Unlock with 1 Credit </>}
                        </button>
                      ) : (
                        <button
                          onClick={handleBuyCredits}
                          disabled={buying}
                          className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-500/30 active:scale-[0.98] disabled:opacity-50"
                        >
                          {buying ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Zap className="w-6 h-6 fill-white" /> Get 10 Credits - 2,000 TZS </>}
                        </button>
                      )}
                    </div>
                    {msg.text && (
                      <p className={`text-sm font-bold ${msg.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {msg.text}
                      </p>
                    )}
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
