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

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://earn-paper.vercel.app/embed" />
        <meta property="og:title" content="Earn-paper App" />
        <meta property="og:description" content="Earn Credits, Unlock Rewards!" />
        <meta property="og:image" content="https://images2.imgbox.com/d4/59/OWTjS7DE_o.jpg" />
        <meta property="og:image:secure_url" content="https://images2.imgbox.com/d4/59/OWTjS7DE_o.jpg" />
        <meta property="og:image:alt" content="Earn-paper App Banner" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Earn-paper App" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yourtwitterhandle" />
        <meta name="twitter:title" content="Earn-paper App" />
        <meta name="twitter:description" content="Earn Credits, Unlock Rewards!" />
        <meta name="twitter:image" content="https://images2.imgbox.com/d4/59/OWTjS7DE_o.jpg" />
        <meta name="twitter:image:alt" content="Preview of Earn-paper App" />
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
