"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, ArrowLeft, ChevronDown, DollarSign, TrendingUp, Users, Gift } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useUser()
  const [topEarners, setTopEarners] = useState([])

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access your dashboard.')
    }
  }, [user])

  // Fetch top earners (you can implement this as needed)
  useEffect(() => {
    const fetchTopEarners = async () => {
      // Fetch logic here
    }
    fetchTopEarners()
  }, [])

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/" className="text-2xl font-bold text-blue-600">Earn-paper</Link>
            </div>
            <nav className="hidden md:flex space-x-10">
              <Link href="/dashboard" className="text-base font-medium text-gray-900">Dashboard</Link>
              <Link href="/referral" className="text-base font-medium text-gray-500 hover:text-gray-900">Refer & Earn</Link>
              <Link href="/redeem" className="text-base font-medium text-gray-500 hover:text-gray-900">Cashout</Link>
              <Link href="/offers" className="text-base font-medium text-gray-500 hover:text-gray-900">Offers</Link>
            </nav>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage src="/avatars/default.jpg" alt={fullName} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2">{fullName}</span>
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/referral" className="w-full">Refer & Earn</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/redeem" className="w-full">Cashout</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/offers" className="w-full">Offers</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome to Your Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-blue-100 shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-600">Your Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800">${user?.credits?.toFixed(2) || "0.00"}</p>
                <p className="text-gray-600">Total earnings available for withdrawal</p>
              </CardContent>
            </Card>

            <Card className="bg-green-100 shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-600">Referral Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800">{user?.referrals || 0}</p>
                <p className="text-gray-600">Total referrals made</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-100 shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
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
      </main>
    </div>
  )
}
