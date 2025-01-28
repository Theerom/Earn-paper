"use client"

import { useState } from 'react'
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

const topEarners = [
  { id: 1, name: "John Doe", earnings: 1250, avatar: "/avatars/john.jpg" },
  { id: 2, name: "Jane Smith", earnings: 980, avatar: "/avatars/jane.jpg" },
  { id: 3, name: "Bob Johnson", earnings: 875, avatar: "/avatars/bob.jpg" },
  { id: 4, name: "Alice Brown", earnings: 720, avatar: "/avatars/alice.jpg" },
  { id: 5, name: "Charlie Davis", earnings: 650, avatar: "/avatars/charlie.jpg" },
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

  // Get user initials
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'
  
  // Get earnings data based on user credits
  const earningsData = user ? getEarningsData(user.credits) : []

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/" className="text-2xl font-bold text-blue-600">EarnApp</Link>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <Link href="/dashboard" className="text-base font-medium text-gray-900">
                Dashboard
              </Link>
              <Link href="/referral" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Refer & Earn
              </Link>
              <Link href="/redeem" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Cashout
              </Link>
              <Link href="/offers" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Offers
              </Link>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Balance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${user?.credits.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">
                  Your current balance
                </p>
              </CardContent>
            </Card>

            {/* Earnings Chart */}
            <Card className="col-span-1 sm:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earnings Overview</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEarningsChart(!showEarningsChart)}>
                  {showEarningsChart ? 'Hide Chart' : 'Show Chart'}
                </Button>
              </CardHeader>
              <CardContent>
                {showEarningsChart ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Line 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Click 'Show Chart' to view your earnings overview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tasks Grid */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <Link 
                  key={task.id} 
                  href={task.href}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 ease-in-out"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${task.color}`}>
                        <task.icon className="h-6 w-6" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {task.title}
                          </dt>
                        </dl>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Earners */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Earners</CardTitle>
                <CardDescription>This week's top performers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {topEarners.map((earner, index) => (
                    <li key={earner.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-500 w-5">{index + 1}</span>
                        <Avatar>
                          <AvatarImage src={earner.avatar} alt={earner.name} />
                          <AvatarFallback>{earner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{earner.name}</span>
                      </div>
                      <span className="font-semibold text-green-600">${earner.earnings}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
