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
    
    // Check if the email already exists
    const userResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I', // Adjust the range as needed
    })

    const rows = userResponse.data.values || []
    const emailExists = rows.some(row => row[1] === email) // Assuming email is in the second column (index 1)

    if (emailExists) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create new user
    const userId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Prepare the new user data
    const newUser = [
      userId,
      email.toLowerCase(),
      hashedPassword,
      firstName,
      lastName,
      newReferralCode,
      '', // referredBy (initially empty)
      5, // initial credits
      0, // initial earnings
      new Date().toISOString() // timestamp
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

    // Check if referral code is provided
    if (referralCode) {
      // Find the referrer in the database
      const referrerRow = rows.find(row => row[5] === referralCode) // Assuming referral code is in the sixth column
      if (referrerRow) {
        const referrerEmail = referrerRow[1] // Get the referrer email
        const referrerCredits = parseFloat(referrerRow[7]) || 0 // Assuming credits are in the eighth column

        // Update referrer's credits
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!H${referrerRow[0] + 1}`, // Update the correct row for the referrer
          valueInputOption: 'RAW',
          requestBody: {
            values: [[referrerCredits + 5]], // Add $5 to referrer's credits
          },
        })
      }
    }

    // After creating the user, generate a JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    // Create response with user data
    const signupResponse = NextResponse.json({
      message: "Account created successfully",
      user: {
        id: userId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        credits: 5 // Set initial credits
      }
    })

    // Set JWT token in cookie
    signupResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return signupResponse
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
} 