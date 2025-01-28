"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, ArrowLeft, ChevronDown, DollarSign, TrendingUp, Users, Gift } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

const tasks = [
  { 
    id: 1, 
    title: "Offers", 
    icon: Gift,
    href: "/offers",
    color: "text-purple-500"
  },
  { 
    id: 2, 
    title: "Refer & Earn", 
    icon: Users,
    href: "/referral",
    color: "text-blue-500"
  }
]

const getEarningsData = (credits: number) => {
  const currentDate = new Date()
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(currentDate.getMonth() - (5 - i))
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      earnings: i === 5 ? credits : credits * (Math.random() * 0.5 + 0.25) // Simulated historical data
    }
  })
  return last6Months
}

export default function Dashboard() {
  const [showEarningsChart, setShowEarningsChart] = useState(false)
  const { user } = useUser()
  const [topEarners, setTopEarners] = useState([])

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access your dashboard.')
    }
  }, [user])

  // Fetch top earners
  useEffect(() => {
    const fetchTopEarners = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return

        const { id, email } = JSON.parse(storedUser)
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id, email })
        })

        if (res.ok) {
          const data = await res.json()
          setTopEarners(data.topEarners || [])
        }
      } catch (error) {
        console.error('Error fetching top earners:', error)
      }
    }

    fetchTopEarners()
    const intervalId = setInterval(fetchTopEarners, 30000)
    return () => clearInterval(intervalId)
  }, [])

  // Get user initials
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'
  
  // Get earnings data based on user credits
  const earningsData = user ? getEarningsData(user.credits) : []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
  )
}
