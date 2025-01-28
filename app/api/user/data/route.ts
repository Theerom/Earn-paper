import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = response.data.values || []
    const userRow = rows.find((row: string[]) => row[0] === userId && row[1] === email)

    if (!userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = {
      id: userRow[0],
      email: userRow[1],
      firstName: userRow[3],
      lastName: userRow[4],
      referralCode: userRow[5],
      credits: parseFloat(userRow[7]) || 0
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
} 