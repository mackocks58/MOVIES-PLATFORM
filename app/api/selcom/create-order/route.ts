import { NextRequest, NextResponse } from 'next/server';
import { createSelcomOrder } from '@/lib/selcom';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, movieTitle, amount, userId, buyerEmail, buyerName, buyerPhone } = body;

    if (!movieId || !movieTitle || !amount || !buyerEmail || !buyerName || !buyerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: movieId, movieTitle, amount, buyerEmail, buyerName, buyerPhone' },
        { status: 400 }
      );
    }

    const orderId = `cinestream_${userId || 'guest'}_${movieId}_${Date.now()}`;

    const result = await createSelcomOrder({
      orderId,
      buyerEmail,
      buyerName,
      buyerPhone,
      amount: Number(amount),
      currency: 'TZS',
      movieId,
      movieTitle,
      userId: userId || 'guest',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      paymentUrl: result.paymentUrl,
      orderId,
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
