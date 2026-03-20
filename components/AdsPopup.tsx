'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Zap } from 'lucide-react';
import Image from 'next/image';
import { useMovies } from '@/lib/use-movies';
import Link from 'next/link';

export function AdsPopup() {
  const [show, setShow] = useState(false);
  const { movies } = useMovies('all');
  const [randomMovie, setRandomMovie] = useState<any>(null);

  useEffect(() => {
    // Show popup randomly every 30-60 seconds if movies are loaded
    const interval = setInterval(() => {
      if (movies.length > 0 && !show) {
        const randomIndex = Math.floor(Math.random() * movies.length);
        setRandomMovie(movies[randomIndex]);
        setShow(true);
      }
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [movies, show]);

  if (!show || !randomMovie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-dark-900 rounded-2xl overflow-hidden border border-brand-500/30 shadow-2xl shadow-brand-500/20"
        >
          {/* Close Button */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ad Content */}
          <div className="relative aspect-video">
            <Image
              src={randomMovie.posterUrl || 'https://placehold.co/600x400/1a1a1a/eb751d?text=New+Release'}
              alt={randomMovie.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-500 text-[10px] font-bold text-white uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-white" />
              New Upload
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">{randomMovie.title}</h3>
            <p className="text-dark-400 text-sm line-clamp-2 mb-6">
              {randomMovie.description || "Don't miss out on this new premium movie! Watch it now in high definition quality."}
            </p>

            <Link
              href={`/watch/${randomMovie.id}`}
              onClick={() => setShow(false)}
              className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all"
            >
              Watch Now
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            
            <button
              onClick={() => setShow(false)}
              className="w-full text-center mt-4 text-xs text-dark-500 hover:text-dark-300 transition-colors"
            >
              Skip
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
