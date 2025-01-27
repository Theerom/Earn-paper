"use client"

import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  username: string
  referralCode: string
  earnings: number
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage or session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
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
    clearUser
  }
} 