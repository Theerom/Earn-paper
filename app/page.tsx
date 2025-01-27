import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Earn Credits App</h1>
        <p className="text-2xl mb-8">Earn Credits, Unlock Rewards!</p>
        <Link href="/login">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}
