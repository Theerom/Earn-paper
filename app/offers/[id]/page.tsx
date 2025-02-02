"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Gift } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const offers = [
  { id: 1, title: "Complete Survey", description: "Earn 100 credits", icon: "📝" },
  { id: 2, title: "Watch Video", description: "Earn 50 credits", icon: "🎥" },
  { id: 3, title: "Install App", description: "Earn 200 credits", icon: "📱" },
  { id: 4, title: "Refer a Friend", description: "Earn 500 credits", icon: "👥" },
]

export default function OffersPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600 mr-10">EarnApp</Link>
              <nav className="hidden md:flex space-x-10">
                <Link href="/dashboard" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/referral" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Refer & Earn
                </Link>
                <Link href="/redeem" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Cashout
                </Link>
                <Link href="/offers" className="text-base font-medium text-gray-900">
                  Offers
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold mb-6">Available Offers</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-2">{offer.icon}</span>
                    {offer.title}
                  </CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Offer</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
