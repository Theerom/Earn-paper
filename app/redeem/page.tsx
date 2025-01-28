"use client"

import { useUser } from '@/hooks/useUser'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/shared/Navigation'

export default function RedeemPage() {
  const { user } = useUser()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [amount, setAmount] = useState('')
  const minAmount = 500

  if (!user) return <div>Loading...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.credits || user.credits < minAmount) {
      toast.error(`You need at least $${minAmount} to cash out`)
      return
    }

    if (!paymentMethod || !paymentDetails || !amount) {
      toast.error('Please fill in all fields')
      return
    }

    const withdrawAmount = parseFloat(amount)
    if (withdrawAmount > user.credits) {
      toast.error('Amount exceeds available balance')
      return
    }

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: withdrawAmount,
          paymentMethod,
          paymentDetails
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed')
      }

      // Update local user state with new balance
      if (user) {
        user.credits = data.newBalance
      }

      toast.success('Withdrawal request submitted successfully')
      
      // Navigate to processing page
      router.push(`/redeem/processing?amount=${withdrawAmount}&method=${encodeURIComponent(paymentMethod)}`)
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process withdrawal')
    }
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Cash Out Your Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold">${user?.credits?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Minimum Withdrawal</p>
                  <p className="text-lg font-semibold">${minAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {user?.credits && user.credits >= minAmount ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDetails">Payment Details</Label>
                  <Input
                    id="paymentDetails"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Enter your payment details"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Withdraw ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={minAmount}
                    max={user?.credits}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Request Withdrawal
                </Button>
              </form>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
                <p className="font-semibold">Minimum withdrawal amount not reached</p>
                <p className="text-sm mt-1">
                  You need at least ${minAmount} to make a withdrawal. Keep completing
                  tasks to reach the minimum amount!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

