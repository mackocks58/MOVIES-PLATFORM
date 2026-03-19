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
  const [category, setCategory] = useState<string>('all');
  const { movies, loading } = useMovies(category);
  const { user } = useAuth();
  const { hasPaid } = useUserPayments(user?.uid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-400 text-sm font-medium mb-6"
        >
          Premium streaming in Tanzania
        </motion.span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">
          Premium Movies & Series
        </h1>
        <p className="text-dark-400 max-w-xl mx-auto text-lg">
          Action, Seasons, Bongo movies and more. Pay once per movie, watch forever.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-2 mb-12"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              category === cat.slug
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'bg-dark-800/80 text-dark-300 hover:bg-dark-700 hover:text-white border border-dark-600/50'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl shimmer bg-dark-800/50" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <Film className="w-20 h-20 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-lg">No movies in this category yet.</p>
          <p className="text-dark-500 text-sm mt-2">Check back soon!</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} hasPaid={hasPaid(movie.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
