import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

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
      // Add other cases as needed
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function handleGetUser(email: string, password: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: 'Users!A:F',
  })

  const rows = response.data.values || []
  const user = rows.find(row => row[1] === email && row[2] === password)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
} 