'use client';

import { useEffect, useState } from 'react';
import { db, ref, onValue, off, set, get, child } from '@/lib/firebase';

export function useUserPayments(userId: string | undefined) {
  const [paidMovieIds, setPaidMovieIds] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPaidMovieIds([]);
      setCredits(0);
      setLoading(false);
      return;
    }
    const paymentsRef = ref(db, `payments/${userId}`);
    const unsub = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      const ids = data?.movieIds || [];
      setPaidMovieIds(Array.isArray(ids) ? ids : []);
      setCredits(data?.credits || 0);
      setLoading(false);
    });
    return () => off(paymentsRef);
  }, [userId]);

  const unlockMovieWithCredits = async (movieId: string) => {
    if (!userId || credits <= 0) return { success: false, error: 'No credits available' };
    
    const userPaymentsRef = ref(db, `payments/${userId}`);
    const snapshot = await get(userPaymentsRef);
    const data = snapshot.val() || { movieIds: [], credits: 0 };
    
    if (data.movieIds?.includes(movieId)) return { success: true };
    if (data.credits <= 0) return { success: false, error: 'No credits available' };
    
    const updatedMovieIds = [...(data.movieIds || []), movieId];
    const updatedCredits = data.credits - 1;
    
    await set(userPaymentsRef, {
      ...data,
      movieIds: updatedMovieIds,
      credits: updatedCredits
    });
    
    return { success: true };
  };

  return { 
    paidMovieIds, 
    credits,
    hasPaid: (movieId: string) => paidMovieIds.includes(movieId), 
    unlockMovieWithCredits,
    loading 
  };
}
