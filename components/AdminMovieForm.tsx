'use client';
import { Clapperboard, Upload, Loader2 } from 'lucide-react';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

import { db, storage, storageRef, uploadBytesResumable, getDownloadURL } from '@/lib/firebase';
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setProgress(0);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be signed in');

      let videoUrl = '';
      let posterUrl = '';

      if (videoFile) {
        const videoId = `v_${Date.now()}_${videoFile.name.replace(/\s/g, '_')}`;
        const videoStorageRef = storageRef(storage, `movies/${videoId}`);
        const uploadTask = uploadBytesResumable(videoStorageRef, videoFile);
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
            reject,
            async () => {
              videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } else {
        throw new Error('Please select a video file');
      }

      if (posterFile) {
        const posterId = `p_${Date.now()}_${posterFile.name.replace(/\s/g, '_')}`;
        const posterStorageRef = storageRef(storage, `posters/${posterId}`);
        await uploadBytesResumable(posterStorageRef, posterFile);
        posterUrl = await getDownloadURL(posterStorageRef);
      } else {
        posterUrl = `https://placehold.co/400x600/1a1a1a/eb751d?text=${encodeURIComponent(title)}`;
      }

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
      setVideoFile(null);
      setPosterFile(null);
      onSuccess?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-dark-900/80 border border-dark-700/50 rounded-2xl p-8"
    >
      <h3 className="text-lg font-semibold mb-6">Add new movie </h3>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-dark-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white"
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
          <label className="block text-sm text-dark-400 mb-2">Video file (MP4)</label>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            required
            className="hidden"
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dashed border-dark-600 text-dark-300 hover:border-brand-500 hover:text-brand-500 flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            {videoFile ? videoFile.name : 'Select video'}
          </button>
        </div>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Poster image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-500 file:text-white"
          />
        </div>
      </div>
      {progress > 0 && progress < 100 && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
            <motion.div
              className="h-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 px-8 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Clapperboard className="w-5 h-5" />
            Add movie
          </>
        )}
      </button>
    </motion.form>
  );
}
