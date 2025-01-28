"use client"

import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  credits: number
  referralCode: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async () => {
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
        const userData = await res.json()
        setUser(userData.user)
        localStorage.setItem('user', JSON.stringify(userData.user))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    // Initial load from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)

    // Fetch fresh data immediately
    fetchUserData()

    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(fetchUserData, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearUser = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return {
    user,
    loading,
    updateUser,
    clearUser,
    refreshUser: fetchUserData
  }
} 