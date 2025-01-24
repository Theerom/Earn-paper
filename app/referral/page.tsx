"use client"

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import type { TopEarner, EarningsData } from '@/types'

export default function ReferralPage() {
  const { user, loading } = useAuth()
  const baseUrl = "https://your-website.com"

  if (loading) return <div>Loading...</div>

  const shareText = `Join me on Earnpaper and get started earning! Use my referral code: ${user?.referralCode} - ${baseUrl}`

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  const shareViaEmail = () => {
    window.open(`mailto:?subject=Join me on Earnpaper&body=${encodeURIComponent(shareText)}`, '_blank')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
    toast.success('Referral link copied to clipboard!')
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Join Earnpaper - Refer & Earn $5 per Referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg font-semibold">Your Referral Code:</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="bg-gray-100 px-4 py-2 rounded">{user?.referralCode}</code>
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Share via:</h3>
            <div className="flex gap-4">
              <Button onClick={shareViaWhatsApp} className="flex-1">
                WhatsApp
              </Button>
              <Button onClick={shareViaEmail} className="flex-1">
                Email
              </Button>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">How it works:</h3>
            <ul className="list-disc list-inside mt-2 space-y-2 text-blue-800">
              <li>Share your referral code with friends</li>
              <li>They sign up using your code</li>
              <li>You earn $5 for each verified signup</li>
              <li>Your earnings are added automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

