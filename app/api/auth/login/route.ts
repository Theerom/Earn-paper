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

    // Fetch user data
    const userResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I', // Adjust the range as needed
    })

    const rows = userResponse.data.values || []
    const userRow = rows.find(row => row[1] === email.toLowerCase()) // Assuming email is in the second column (index 1)

    if (!userRow) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, userRow[2]) // Assuming hashed password is in the third column (index 2)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // After successful login, generate a JWT token
    const token = jwt.sign({ userId: userRow[0] }, JWT_SECRET, { expiresIn: '7d' })

    // Create response with user data
    const loginResponse = NextResponse.json({
      message: "Login successful",
      user: {
        id: userRow[0],
        email: userRow[1],
        firstName: userRow[3],
        lastName: userRow[4],
        credits: parseFloat(userRow[7]) || 0 // Assuming credits are in the eighth column
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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
} 