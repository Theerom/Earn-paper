import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

// Clean and format the private key
const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '')
  .replace(/\\n/g, '\n')
  .replace(/"(.+)"/, '$1')

const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    console.log('Attempting login for:', email)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Sheet1!A:I"
    })

    const rows = response.data.values || []
    const user = rows.find(row => row[1] === email && row[2] === password)

    if (!user) {
      console.log('User not found or invalid credentials')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({
      id: user[0],
      email: user[1],
      firstName: user[3],
      lastName: user[4],
      referralCode: user[5],
      referredBy: user[6],
      credits: parseFloat(user[7]) || 0
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
} 