'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovies } from '@/lib/use-movies';
import { useUserPayments } from '@/lib/use-payments';
import { useAuth } from '@/components/AuthProvider';
import { MovieCard } from '@/components/MovieCard';
import { CATEGORIES } from '@/lib/db-types';
import { Film } from 'lucide-react';

export default function HomePage() {
  const { movies, loading } = useMovies('all');
  const { user } = useAuth();
  const { hasPaid, credits } = useUserPayments(user?.uid);
  const [buying, setBuying] = useState(false);
  
  const handleBuyCredits = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
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
          buyerPhone: '255700000000', // Default phone or prompt
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      if (data.paymentUrl) window.location.href = data.paymentUrl;
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBuying(false);
    }
  };

  // Group movies by category
  const groupedMovies = CATEGORIES.filter(c => c.slug !== 'all').map(cat => ({
    ...cat,
    movies: movies.filter(m => m.category === cat.slug)
  })).filter(group => group.movies.length > 0);

  if (loading) {
// ... loading state ...
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-64 w-full rounded-3xl shimmer bg-dark-800/50 mb-12" />
        {[...Array(3)].map((_, j) => (
          <div key={j} className="mb-12">
            <div className="h-8 w-48 rounded shimmer bg-dark-800/50 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl shimmer bg-dark-800/50" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-[2.5rem] overflow-hidden bg-dark-900 border border-brand-500/20 p-8 sm:p-14 mb-20 text-center sm:text-left shadow-2xl shadow-brand-500/10"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold mb-8 tracking-wide uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Premium Streaming in Tanzania
          </motion.div>
          <h1 className="text-4xl sm:text-7xl font-display font-black text-white mb-8 leading-[1.1]">
            Unlock <span className="gradient-text">10 Movies</span> for 2,000 TZS
          </h1>
          <p className="text-dark-300 text-lg sm:text-xl mb-10 leading-relaxed max-w-lg">
            Pay once and get 10 credits to unlock any movie or series. Watch your favorite content forever.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
             <button 
               onClick={handleBuyCredits}
               disabled={buying}
               className="group relative px-10 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-lg transition-all shadow-xl shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
             >
               {buying ? 'Purchasing...' : 'Buy 10 Credits Now'}
               <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
             </button>
             {user && (
               <div className="px-6 py-4 rounded-2xl bg-dark-800/50 border border-dark-700 text-dark-200 font-medium">
                 Your Balance: <span className="text-brand-500 font-bold">{credits} Credits</span>
               </div>
             )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand-500/10 via-brand-500/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/20 blur-[100px] rounded-full" />
      </motion.div>

      {/* Grouped Movies sections */}
      {groupedMovies.map((group, groupIdx) => (
        <section key={group.slug} className="mb-20 last:mb-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-3xl shadow-lg">
              {group.icon}
            </div>
            <div>
              <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">
                {group.label}
              </h2>
              <div className="h-1 w-20 bg-brand-500 rounded-full mt-1" />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            <AnimatePresence mode="popLayout">
              {group.movies.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} hasPaid={hasPaid(movie.id)} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}

      {movies.length === 0 && (
        <div className="text-center py-32 rounded-[2.5rem] bg-dark-900/50 border-2 border-dashed border-dark-800">
          <Film className="w-20 h-20 text-dark-700 mx-auto mb-6 opacity-50" />
          <p className="text-dark-400 text-xl font-bold">No movies found in this collection.</p>
          <p className="text-dark-600 mt-2">Our team is uploading new content every day.</p>
        </div>
      )}
    </div>
  );
}
