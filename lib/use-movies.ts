'use client';

import { useEffect, useState } from 'react';
import { db, ref, onValue, off } from '@/lib/firebase';
import type { Movie } from '@/lib/db-types';

export function useMovies(category?: string) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const moviesRef = ref(db, 'movies');
    const unsub = onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      let list: Movie[] = [];
      if (data) {
        list = Object.entries(data).map(([id, v]) => ({ ...(v as Omit<Movie, 'id'>), id })) as Movie[];
      }
      if (category && category !== 'all') {
        list = list.filter((m) => m.category === category);
      }
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMovies(list);
      setLoading(false);
    });
    return () => off(moviesRef);
  }, [category]);

  return { movies, loading };
}
