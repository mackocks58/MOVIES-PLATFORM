import type { Metadata } from 'next';
import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Nav } from '@/components/Nav';
import { AdsPopup } from '@/components/AdsPopup';

const sora = Sora({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'CineStream | Premium Movies & Series',
  description: 'Watch Action, Seasons, Bongo movies and more. Pay once, watch forever.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-dark-950 text-dark-50">
        <AuthProvider>
          <div className="min-h-screen bg-gradient-mesh">
            <Nav />
            <AdsPopup />
            <main className="pt-20">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
