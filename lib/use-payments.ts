'use client';

import { useEffect, useState } from 'react';
import { db, ref, onValue, off } from '@/lib/firebase';

export function useUserPayments(userId: string | undefined) {
  const [paidMovieIds, setPaidMovieIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPaidMovieIds([]);
      setLoading(false);
      return;
    }
    const paymentsRef = ref(db, `payments/${userId}`);
    const unsub = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      const ids = data?.movieIds || [];
      setPaidMovieIds(Array.isArray(ids) ? ids : []);
      setLoading(false);
    });
    return () => off(paymentsRef);
  }, [userId]);

  return { paidMovieIds, hasPaid: (movieId: string) => paidMovieIds.includes(movieId), loading };
}
