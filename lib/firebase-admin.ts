import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';

let _db: Database | null = null;

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0] as App;
  }
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : undefined;
  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON env for server-side Firebase');
  }
  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

export function getAdminDb(): Database {
  if (!_db) {
    _db = getDatabase(getAdminApp());
  }
  return _db;
}
