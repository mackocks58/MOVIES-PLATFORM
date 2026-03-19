'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Play } from 'lucide-react';
import type { Movie } from '@/lib/db-types';

interface MovieCardProps {
  movie: Movie;
  index: number;
  hasPaid: boolean;
}

export function MovieCard({ movie, index, hasPaid }: MovieCardProps) {
  const poster = movie.posterUrl || `https://placehold.co/400x600/1a1a1a/eb751d?text=${encodeURIComponent(movie.title)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/watch/${movie.id}`}>
        <div className="relative rounded-xl overflow-hidden bg-dark-800/50 border border-dark-700/50 hover:border-brand-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10">
          <div className="aspect-[2/3] relative">
            <Image
              src={poster}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              {hasPaid ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center"
                >
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-2 px-4 py-2 rounded-lg bg-dark-900/90 border border-brand-500/50"
                >
                  <Lock className="w-10 h-10 text-brand-500" />
                  <span className="text-sm font-medium text-white">Pay to Unlock</span>
                </motion.div>
              )}
            </div>
            {!hasPaid && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-brand-500/90 text-xs font-bold text-white">
                TZS {movie.price?.toLocaleString()}
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
              {movie.title}
            </h3>
            <p className="text-xs text-dark-400 truncate">{movie.category}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
