"use client"

import { useState } from 'react'
import { ArrowLeft, Bell, Copy, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ReferralSection() {
  const [referralCode] = useState("H2F5GH")
  const { toast } = useToast()
  const router = useRouter()
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    })
  }

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
                <Link href="/referral" className="text-base font-medium text-gray-900">
                  Refer & Earn
                </Link>
                <Link href="/redeem" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Cashout
                </Link>
                <Link href="/offers" className="text-base font-medium text-gray-500 hover:text-gray-900">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Refer to Earn $5 per person</CardTitle>
              <CardDescription>Share your referral code and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  value={referralCode}
                  readOnly
                  className="text-lg font-mono bg-gray-50"
                />
                <Button onClick={copyToClipboard} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Code
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share via WhatsApp
                </Button>
                <Button className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share via Email
                </Button>
                <Button className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share via SMS
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>Share your unique referral code with friends</li>
                <li>Friends sign up using your code</li>
                <li>You earn $5 when they complete their first task</li>
                <li>There's no limit to how much you can earn!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
