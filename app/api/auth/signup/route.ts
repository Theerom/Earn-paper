import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, referralCode } = await request.json()
    
    // Check if email exists
    const existingUsers = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!B:B',
    })

    const emails = existingUsers.data.values || []
    if (emails.flat().includes(email.toLowerCase())) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Validate referral code
    const referrals = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:F',
    })

    const rows = referrals.data.values || []
    const referrer = rows.find((row: string[]) => row[5] === referralCode.toUpperCase())
    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    // Create new user
    const userId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          userId,
          email.toLowerCase(),
          hashedPassword,
          firstName,
          lastName,
          newReferralCode,
          referrer[0], // referredBy (user ID of referrer)
          0, // initial credits
          new Date().toISOString()
        ]]
      }
    })

    // After creating the user, generate a JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    // Create response with user data
    const response = NextResponse.json({ 
      message: "Account created successfully",
      user: {
        id: userId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        credits: 0
      }
    })

    // Set JWT token in cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
} 