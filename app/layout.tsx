import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Earn-paper App",
  description: "Earn Credits, Unlock Rewards!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="app-root">{children}</div>
      </body>
    </html>
  )
}
