import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = sheetsResponse.data.values || []
    const user = rows.find((row: string[]) => row[1] === email.toLowerCase())

    if (!user || !await bcrypt.compare(password, user[2])) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user[0] }, JWT_SECRET, { expiresIn: '7d' })

    const loginResponse = NextResponse.json({ 
      message: "Login successful",
      user: {
        id: user[0],
        email: user[1],
        firstName: user[3],
        lastName: user[4],
        credits: parseFloat(user[7]) || 0
      }
    })

    // Set JWT token in cookie
    loginResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return loginResponse
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
} 