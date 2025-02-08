'use client';

import { Inter } from 'next/font/google'
import "./globals.css"
import Head from 'next/head';
import { useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch('/api/cron');
      } catch (error) {
        console.error('Error updating credits:', error);
      }
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="app-root">{children}</div>
      </body>
    </html>
  )
}
