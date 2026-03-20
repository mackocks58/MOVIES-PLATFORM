import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, result, resultcode, payment_status, transid, reference } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const isSuccess = result === 'SUCCESS' && (payment_status === 'COMPLETED' || resultcode === '000');

    if (!isSuccess) {
      return NextResponse.json({ received: true });
    }

    const parts = String(order_id).split('_');
    if (parts.length < 4 || parts[0] !== 'cinestream') {
      return NextResponse.json({ received: true });
    }

    const userId = parts[1];
    const movieId = parts[2];

    const db = getAdminDb();
    const paymentsRef = db.ref(`payments/${userId}`);
    const snapshot = await paymentsRef.once('value');
    const existing = snapshot.val() || { movieIds: [], credits: 0, lastUpdated: 0 };
    
    let movieIds = Array.isArray(existing.movieIds) ? [...existing.movieIds] : [];
    let credits = existing.credits || 0;

    if (movieId === 'credits') {
      credits += 10;
    } else {
      if (!movieIds.includes(movieId)) {
        movieIds.push(movieId);
      }
    }

    await paymentsRef.set({
      userId,
      movieIds,
      credits,
      lastUpdated: Date.now(),
    });

    const paymentRecordRef = db.ref(`paymentRecords/${order_id}`);
    await paymentRecordRef.set({
      orderId: order_id,
      userId,
      movieId,
      transid: transid || null,
      reference: reference || null,
      status: 'COMPLETED',
      completedAt: Date.now(),
    });

    return NextResponse.json({ received: true });
  } catch (e) {
    const err = e as Error;
    console.error('Selcom webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
