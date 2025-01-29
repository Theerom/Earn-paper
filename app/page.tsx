import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Head from 'next/head'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Earn-paper App</title>
        <meta property="og:title" content="Earn-paper App" />
        <meta property="og:description" content="Earn Credits, Unlock Rewards!" />
        <meta property="og:image" content="https://images2.imgbox.com/d4/59/OWTjS7DE_o.jpg" />
        <meta property="og:url" content="https://earn-paper.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Earn-paper App" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Earn-paper App</h1>
          <p className="text-2xl mb-8">Earn Credits, Unlock Rewards!</p>
          <Link href="/login">
            <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
