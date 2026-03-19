import { NextRequest, NextResponse } from 'next/server';

async function checkPayment(userId: string, movieId: string): Promise<boolean> {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();
    const ref = db.ref(`payments/${userId}`);
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    const movieIds = data?.movieIds || [];
    return Array.isArray(movieIds) && movieIds.includes(movieId);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const movieId = searchParams.get('movieId');

  if (!userId || !movieId) {
    return NextResponse.json({ paid: false });
  }

  const paid = await checkPayment(userId, movieId);
  return NextResponse.json({ paid });
}
