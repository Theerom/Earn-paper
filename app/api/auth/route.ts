import { NextResponse } from 'next/server'
import { getUser } from '@/lib/sheets'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const user = await getUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user[0],
        email: user[1],
        username: user[3],
        referralCode: user[4],
        earnings: parseFloat(user[5]) || 0
      }
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 