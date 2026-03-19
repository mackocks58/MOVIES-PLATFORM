export type CategorySlug = 'action' | 'seasons' | 'bongo' | 'all';

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  videoUrl: string;
  category: CategorySlug;
  price: number; // TZS
  duration?: string;
  releaseYear?: string;
  createdAt: number;
  updatedAt: number;
  featured?: boolean;
}

export interface Season {
  id: string;
  movieId: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
  createdAt: number;
}

export interface Episode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  duration?: string;
  createdAt: number;
}

export interface Payment {
  id: string;
  userId: string;
  movieId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transid?: string;
  reference?: string;
  createdAt: number;
  completedAt?: number;
}

export interface UserPayment {
  userId: string;
  movieIds: string[];
  lastUpdated: number;
}

export const CATEGORIES = [
  { slug: 'all' as const, label: 'All Movies', icon: '🎬' },
  { slug: 'action' as const, label: 'Action', icon: '💥' },
  { slug: 'seasons' as const, label: 'Seasons', icon: '📺' },
  { slug: 'bongo' as const, label: 'Bongo Movies', icon: '🇹🇿' },
] as const;
