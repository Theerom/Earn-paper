"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useUser()

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access your dashboard.')
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome to Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-blue-100 shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-600">Your Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">${user?.credits?.toFixed(2) || "0.00"}</p>
            <p className="text-gray-600">Total earnings available for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="bg-green-100 shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-600">Referral Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">{user?.referrals || 0}</p>
            <p className="text-gray-600">Total referrals made</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-100 shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-yellow-600">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">${user?.pendingWithdrawals?.toFixed(2) || "0.00"}</p>
            <p className="text-gray-600">Total amount pending for withdrawal</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button className="bg-blue-600 text-white hover:bg-blue-700 transition duration-300">
          Request Withdrawal
        </Button>
      </div>
    </div>
  )
}
