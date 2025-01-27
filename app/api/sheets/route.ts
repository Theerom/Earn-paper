import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

// Clean and format the private key
const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '')
  .replace(/\\n/g, '\n')
  .replace(/"(.+)"/, '$1') // Remove any surrounding quotes

const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

// Add error handling for auth initialization
if (!auth) {
  console.error('Failed to initialize Google Sheets auth')
  throw new Error('Google Sheets authentication failed')
}

const sheets = google.sheets({ version: 'v4', auth })

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  
  try {
    switch (action) {
      case 'getUser':
        const email = searchParams.get('email')
        const password = searchParams.get('password')
        return await handleGetUser(email!, password!)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...data } = body

    switch (action) {
      case 'addUser':
        return await handleAddUser(data)
      case 'updateEarnings':
        return await handleUpdateEarnings(data.userId, data.amount)
      case 'logOffer':
        return await handleLogOffer(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function handleGetUser(email: string, password: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: 'Users!A:I',  // Updated to include all columns
  })

  const rows = response.data.values || []
  const user = rows.find(row => row[1] === email && row[2] === password)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user[0],
      email: user[1],
      password: user[2],
      firstName: user[3],
      lastName: user[4],
      referralCode: user[5],
      referredBy: user[6],
      credits: parseFloat(user[7]) || 0,
      createdAt: user[8]
    }
  })
}

async function handleAddUser(userData: any) {
  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const now = new Date().toISOString()

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: 'Users!A:I',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        Date.now().toString(), // id
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        referralCode,
        userData.referredBy || '',
        0, // initial credits
        now
      ]]
    }
  })

  return NextResponse.json({ referralCode })
}

async function handleUpdateEarnings(userId: string, amount: number) {
  // ... implementation
}

async function handleLogOffer(offerData: any) {
  // ... implementation
} 