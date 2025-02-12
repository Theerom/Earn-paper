import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { addReferralHistory, updateReferrerCreditsImmediately } from '@/utils/updateReferrerCredits'

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

    // Check if the email already exists
    const userResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = userResponse.data.values || []
    const emailExists = rows.some(row => row[1] === email)

    if (emailExists) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create new user
    const userId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Handle referral code
    let referredBy = ''
    if (referralCode) {
      try {
        console.log(`Processing referral code: ${referralCode}`)
        
        // Find the referrer by their referral code
        const referrerRow = rows.find(row => row[5] === referralCode)
        if (referrerRow) {
          referredBy = referrerRow[0]
          console.log(`Found referrer: ${referredBy}`)

          // Add to referral history
          await addReferralHistory(referredBy, userId)

          // Update referrer credits immediately
          await updateReferrerCreditsImmediately(referredBy)
        } else {
          console.log(`Referrer with code ${referralCode} not found`)
        }
      } catch (err) {
        console.error('Error processing referral:', err)
      }
    }

    // Prepare the new user data
    const newUser = [
      userId,
      email.toLowerCase(),
      hashedPassword,
      firstName,
      lastName,
      newReferralCode,
      referredBy,
      5,
      new Date().toISOString(),
    ]

    // Save new user to the Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newUser],
      },
    })

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    const signupResponse = NextResponse.json({
      message: "Account created successfully",
      user: {
        id: userId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        credits: 5,
      },
      token,
    })

    // Set JWT token in cookie
    signupResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return signupResponse
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
} 