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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/watch/${movie.id}`}>
        <div className="relative rounded-[2rem] overflow-hidden bg-dark-900 border border-dark-800 transition-all duration-500 group-hover:border-brand-500/50 group-hover:shadow-[0_20px_50px_rgba(235,117,29,0.15)]">
          <div className="aspect-[2/3] relative">
            <Image
              src={poster}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
            />
            
            {/* Glossy overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10 shrink-0">
               {hasPaid ? (
                 <div className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                   Unlocked
                 </div>
               ) : (
                 <div className="px-3 py-1 rounded-full bg-brand-500/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1">
                   <Lock className="w-2.5 h-2.5" />
                   Premium
                 </div>
               )}
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:backdrop-blur-[2px]">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center shadow-2xl shadow-brand-500/50"
              >
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </motion.div>
            </div>
          </div>
          
          <div className="p-5 bg-gradient-to-b from-dark-900 to-black">
            <h3 className="font-bold text-white text-lg truncate group-hover:text-brand-500 transition-colors duration-300">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between mt-2">
               <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">{movie.category}</span>
               {!hasPaid && <span className="text-sm font-black text-brand-400">1 Credit</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
