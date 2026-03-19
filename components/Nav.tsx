'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Film, User, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { signOut, auth } from '@/lib/firebase';

export function Nav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 15 }} className="text-brand-500">
            <Film className="w-8 h-8" />
          </motion.div>
          <span className="font-display font-bold text-xl gradient-text">CineStream</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-brand-500' : 'text-dark-300 hover:text-white'}`}
          >
            Home
          </Link>
          {user?.email?.includes('admin') && (
            <Link
              href="/admin"
              className="text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 text-sm text-dark-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-400 transition-colors"
            >
              <User className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
