# CineStream – Movie Platform

Premium movie platform with Action, Seasons, Bongo movies, and more. Users browse movies but must pay via **Selcom** (Tanzania) to unlock playback.

## Features

- **Categories**: All Movies, Action, Seasons, Bongo Movies
- **Paywall**: Browse all movies; play only after Selcom payment
- **Firebase Realtime Database**: Movies, payments, live updates
- **Firebase Storage**: Video & poster uploads
- **Admin Panel**: Upload movies (MP4 from project folder or any source)
- **Selcom Integration**: Real payment flow with webhook
- **Animated UI**: Framer Motion, Tailwind, polished UX

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create **Realtime Database**
4. Enable **Storage**
5. Copy config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
```

6. **Service account** (for Selcom webhook): Project Settings → Service accounts → Generate new private key. Put the JSON content in `FIREBASE_SERVICE_ACCOUNT_JSON` (as a single-line string in `.env.local`), or use `GOOGLE_APPLICATION_CREDENTIALS` pointing to the JSON file.

7. Deploy rules:
   ```bash
   firebase deploy
   ```

### 3. Selcom

1. Sign up at [Selcom](https://developers.selcommobile.com/) and get:
   - Vendor ID
   - API Key
   - API Secret

2. Add to `.env.local`:

```env
SELCOM_VENDOR_ID=...
SELCOM_API_KEY=...
SELCOM_API_SECRET=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

3. Configure webhook URL in Selcom dashboard: `https://yourdomain.com/api/selcom/webhook`

### 4. Admin access

Create a user whose email contains `admin`, e.g. `admin@yourdomain.com`. That user can access `/admin` and upload movies.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `/` – Home, movie grid by category
- `/watch/[id]` – Movie page with paywall and video player
- `/login` – Sign in / sign up
- `/admin` – Admin panel (admin users only)

## Payment flow

1. User signs in, browses movies
2. Clicks a movie → sees paywall (no playback)
3. Enters name, email, phone → Pay → redirected to Selcom
4. After payment, Selcom calls webhook → we mark movie as paid for that user
5. User is redirected back and can play the video

## Tech stack

- Next.js 14 (App Router)
- Firebase (Auth, Realtime DB, Storage)
- Selcom Checkout API
- Tailwind CSS, Framer Motion
- TypeScript
