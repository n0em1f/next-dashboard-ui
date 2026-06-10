import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Academos',
  description: 'Platforma de management academic',
  icons: {
    icon: '/logo.png',
    shortcut: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children} <ToastContainer position="bottom-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}
