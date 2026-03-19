import CryptoJS from 'crypto-js';

const SELCOM_API = 'https://apigw.selcommobile.com/v1/vcn/create';
const vendor = process.env.SELCOM_VENDOR_ID || '';
const apiKey = process.env.SELCOM_API_KEY || '';
const apiSecret = process.env.SELCOM_API_SECRET || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getTimestamp(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * -1;
  const sign = tz >= 0 ? '+' : '-';
  const hrs = String(Math.floor(Math.abs(tz) / 60)).padStart(2, '0');
  const min = String(Math.abs(tz) % 60).padStart(2, '0');
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}${sign}${hrs}:${min}`;
}

function computeDigest(timestamp: string, signedFields: string[], data: Record<string, unknown>): string {
  const parts = [`timestamp=${timestamp}`];
  for (const field of signedFields) {
    const val = field.includes('.') 
      ? (data as Record<string, Record<string, unknown>>)[field.split('.')[0]]?.[field.split('.')[1]] 
      : data[field];
    if (val !== undefined && val !== null) {
      parts.push(`${field}=${val}`);
    }
  }
  const str = parts.join('&');
  const hash = CryptoJS.HmacSHA256(str, apiSecret);
  return CryptoJS.enc.Base64.stringify(hash);
}

export interface CreateOrderParams {
  orderId: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  currency?: string;
  movieId: string;
  movieTitle: string;
  userId: string;
}

export async function createSelcomOrder(params: CreateOrderParams): Promise<{ ok: boolean; paymentUrl?: string; error?: string }> {
  const { orderId, buyerEmail, buyerName, buyerPhone, amount, movieId, movieTitle, userId } = params;
  const currency = params.currency || 'TZS';

  const webhookUrl = `${appUrl}/api/selcom/webhook`;
  const redirectUrl = `${appUrl}/watch/${movieId}?paid=1`;
  const cancelUrl = `${appUrl}/watch/${movieId}`;

  const data = {
    vendor,
    order_id: orderId,
    buyer_email: buyerEmail,
    buyer_name: buyerName,
    buyer_user_id: userId || 'guest',
    buyer_phone: buyerPhone,
    amount: Math.round(amount),
    currency,
    payment_methods: 'ALL',
    redirect_url: Buffer.from(redirectUrl).toString('base64'),
    cancel_url: Buffer.from(cancelUrl).toString('base64'),
    webhook: Buffer.from(webhookUrl).toString('base64'),
    billing: {
      firstname: buyerName.split(' ')[0] || 'Customer',
      lastname: buyerName.split(' ').slice(1).join(' ') || 'User',
      address_1: 'N/A',
      address_2: '',
      city: 'Dar es Salaam',
      state_or_region: 'Dar es Salaam',
      postcode_or_pobox: '00000',
      country: 'TZ',
      phone: buyerPhone,
    },
    buyer_remarks: `Movie: ${movieTitle}`,
    merchant_remarks: movieId,
    no_of_items: 1,
  };

  const signedFields = 'vendor,order_id,buyer_email,buyer_name,buyer_user_id,buyer_phone,amount,currency,payment_methods,redirect_url,cancel_url,webhook,billing.firstname,billing.lastname,billing.address_1,billing.city,billing.state_or_region,billing.postcode_or_pobox,billing.country,billing.phone,buyer_remarks,merchant_remarks,no_of_items'.split(',');
  const timestamp = getTimestamp();
  const digest = computeDigest(timestamp, signedFields, data as unknown as Record<string, unknown>);
  const authorization = Buffer.from(apiKey).toString('base64');

  try {
    const res = await fetch(SELCOM_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `SELCOM ${authorization}`,
        'Digest-Method': 'HS256',
        'Digest': digest,
        'Timestamp': timestamp,
        'Signed-Fields': signedFields.join(','),
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.result === 'SUCCESS' && json.data?.[0]?.payment_gateway_url) {
      const paymentUrl = json.data[0].payment_gateway_url;
      return { ok: true, paymentUrl };
    }
    return { ok: false, error: json.message || 'Payment order creation failed' };
  } catch (e) {
    const err = e as Error;
    return { ok: false, error: err.message || 'Network error' };
  }
}
