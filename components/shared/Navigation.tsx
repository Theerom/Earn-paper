"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from '@/hooks/useUser'

export default function Navigation() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { user } = useUser()
  const pathname = usePathname()

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Earn-paper
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link 
              href="/dashboard" 
              className={`text-base font-medium ${
                isActive('/dashboard') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/referral" 
              className={`text-base font-medium ${
                isActive('/referral') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Refer & Earn
            </Link>
            <Link 
              href="/redeem" 
              className={`text-base font-medium ${
                isActive('/redeem') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Cashout
            </Link>
            <Link 
              href="/offers" 
              className={`text-base font-medium ${
                isActive('/offers') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Offers
            </Link>
          </nav>

          {/* Desktop Profile */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="ml-2 text-sm font-medium text-gray-700">{fullName}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/dashboard" 
                className={`text-base font-medium ${
                  isActive('/dashboard') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/referral" 
                className={`text-base font-medium ${
                  isActive('/referral') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Refer & Earn
              </Link>
              <Link 
                href="/redeem" 
                className={`text-base font-medium ${
                  isActive('/redeem') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Cashout
              </Link>
              <Link 
                href="/offers" 
                className={`text-base font-medium ${
                  isActive('/offers') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Offers
              </Link>
              <div className="pt-4 border-t">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-gray-700">{fullName}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 