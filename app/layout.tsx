'use client';

import { Inter } from 'next/font/google'
import "./globals.css"
import Head from 'next/head';
import { useEffect } from 'react';
import { updateReferrerCredits } from '../utils/updateReferrerCredits';

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Start the interval when the app loads
    const interval = setInterval(updateReferrerCredits, 30 * 1000);
    
    // Cleanup the interval when the component unmounts
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
