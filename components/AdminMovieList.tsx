'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { db, ref, onValue, off } from '@/lib/firebase';
import type { Movie } from '@/lib/db-types';

export function AdminMovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const moviesRef = ref(db, 'movies');
    const unsub = onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? (Object.entries(data).map(([id, v]) => ({ ...(v as Omit<Movie, 'id'>), id })) as Movie[])
        : [];
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMovies(list);
    });
    return () => off(moviesRef);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All movies</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie, i) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-dark-900/60 border border-dark-700/50 rounded-xl overflow-hidden"
          >
            <div className="aspect-video relative">
              <Image
                src={movie.posterUrl || `https://placehold.co/400x225/1a1a1a/eb751d?text=${encodeURIComponent(movie.title)}`}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white truncate">{movie.title}</h3>
              <p className="text-xs text-dark-400">{movie.category} • TZS {movie.price?.toLocaleString()}</p>
              <Link
                href={`/watch/${movie.id}`}
                className="mt-2 inline-block text-sm text-brand-500 hover:text-brand-400"
              >
                View →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      {movies.length === 0 && (
        <p className="text-dark-500 py-8 text-center">No movies yet. Add your first movie above.</p>
      )}
    </div>
  );
}
