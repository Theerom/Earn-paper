import type { Metadata } from "next"
import { Inter } from 'next/font/google'
<<<<<<< HEAD
import './globals.css'
import { ReactNode } from 'react'
=======
import "./globals.css"
>>>>>>> fa29453806de90e43cc448a160a76942d27229b3

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Earn Credits App",
  description: "Earn Credits, Unlock Rewards!",
}

export default function RootLayout({
  children,
}: {
<<<<<<< HEAD
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* You can add meta tags and other head elements here */}
      </head>
=======
  children: React.ReactNode
}) {
  return (
    <html lang="en">
>>>>>>> fa29453806de90e43cc448a160a76942d27229b3
      <body className={inter.className}>
        <div id="app-root">{children}</div>
      </body>
    </html>
  )
}

