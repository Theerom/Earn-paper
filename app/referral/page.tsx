"use client"

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import type { TopEarner, EarningsData } from '@/types'
import { useUser } from '@/hooks/useUser'
import Navigation from '@/components/shared/Navigation'

export default function ReferralPage() {
  const { user, loading } = useUser()
  const webAppUrl = "https://earn-paper.vercel.com"

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login to access referrals</div>

  const shareText = `Join Earn-paper and earn $5 instantly! Sign up using my referral code: ${user.referralCode}\n${webAppUrl}`

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const shareViaEmail = () => {
    const url = `mailto:?subject=Join Earn-paper&body=${encodeURIComponent(shareText)}`
    window.open(url)
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode)
    toast.success('Referral code copied!')
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Join Earn-paper - Refer & Earn $5 per Referral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold">Your Referral Code:</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="bg-gray-100 px-4 py-2 rounded">{user.referralCode}</code>
                <Button onClick={copyReferralCode}>Copy</Button>
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
    </>
  )
}

