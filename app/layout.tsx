import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import './globals.css'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Earn Credits App",
  description: "Earn Credits, Unlock Rewards!",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* You can add meta tags and other head elements here */}
      </head>
      <body className={inter.className}>
        <div id="app-root">{children}</div>
      </body>
    </html>
  )
}

