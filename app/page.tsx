import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Earn-paper App</title>
        <meta name="description" content="Earn credits and unlock rewards with the Earn-paper App." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
        <h1 className="text-6xl font-bold mb-4">Earn-paper App</h1>
        <p className="text-2xl mb-8">Earn Credits, Unlock Rewards!</p>
        <Link href="/login">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-lg">
            Get Started
          </Button>
        </Link>
      </div>
    </>
  );
}
