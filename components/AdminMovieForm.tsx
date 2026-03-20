'use client';
import { Clapperboard, Link, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';
import { auth } from '@/lib/firebase';
import { CATEGORIES, type CategorySlug } from '@/lib/db-types';

interface AdminMovieFormProps {
  onSuccess?: () => void;
}

export function AdminMovieForm({ onSuccess }: AdminMovieFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategorySlug>('action');
  const [price, setPrice] = useState(2000);
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be signed in');

      if (!videoUrl) throw new Error('Please enter a video URL');
      if (!posterUrl) throw new Error('Please enter a poster image URL');

      const moviesRef = ref(db, 'movies');
      const newRef = push(moviesRef);
      const id = newRef.key!;

      const now = Date.now();
      await set(newRef, {
        id,
        title,
        description,
        posterUrl,
        videoUrl,
        category,
        price,
        createdAt: now,
        updatedAt: now,
        featured: false,
      });

      setTitle('');
      setDescription('');
      setCategory('action');
      setPrice(2000);
      setVideoUrl('');
      setPosterUrl('');
      onSuccess?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-dark-900/80 border border-dark-700/50 rounded-2xl p-8"
    >
      <h3 className="text-lg font-semibold mb-6">Add new movie</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-dark-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
            placeholder="e.g. Sisu 2"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
          >
            {CATEGORIES.filter((c) => c.slug !== 'all').map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-dark-400 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
            placeholder="Movie description..."
          />
        </div>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Price (TZS)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={500}
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Video URL (Direct Link)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
            placeholder="https://example.com/movie.mp4"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-dark-400 mb-2">Poster Image URL</label>
          <input
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
            placeholder="https://example.com/poster.jpg"
          />
        </div>
      </div>
      
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 px-8 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Clapperboard className="w-5 h-5" />
            Save Movie
          </>
        )}
      </button>
    </motion.form>
  );
}
