"use client"

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Offers() {
  const { user, loading } = useAuth()
  const MYLEAD_URL = "https://reward-me.eu/5eed231c-d4cc-11ef-b697-8a5fb7be40ea"

  if (loading) return <div>Loading...</div>

  // Add user ID as parameter for tracking
  const MYLEAD_OFFERWALL_URL = user?.id ? `${MYLEAD_URL}?user_id=${user.id}` : MYLEAD_URL

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Complete Offers to Earn</span>
            <span className="text-green-600">Current Balance: ${user?.credits?.toFixed(2) || "0.00"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <iframe 
            src={MYLEAD_OFFERWALL_URL}
            className="w-full min-h-[800px] border-0"
            title="MyLead Offerwall"
          />
        </CardContent>
      </Card>
    </div>
  )
} 