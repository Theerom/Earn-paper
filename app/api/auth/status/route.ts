import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({ isAuthenticated: false })
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string }

    // Initialize Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = response.data.values || []
    const user = rows.find((row: string[]) => row[0] === decoded.userId)

    if (!user) {
      return NextResponse.json({ isAuthenticated: false })
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user[0],
        email: user[1],
        firstName: user[3],
        lastName: user[4],
        credits: parseFloat(user[7]) || 0
      }
    })
  } catch {
    return NextResponse.json({ isAuthenticated: false })
  }
} 