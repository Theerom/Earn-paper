import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

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
    const { email, password, firstName, lastName, referralCode } = await request.json()

    // Check if the email already exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I', // Adjust the range as needed
    })

    const rows = response.data.values || []
    const emailExists = rows.some(row => row[1] === email) // Assuming email is in the second column (index 1)

    if (emailExists) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Add new user to the database
    const newUser = {
      email,
      password, // Make sure to hash the password before saving
      firstName,
      lastName,
      credits: 5, // New user gets $5 credited
      referrals: 0,
    }

    // Save new user to the database (implement your logic here)
    // Example: await saveUserToDatabase(newUser)

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

    // Save the new user to the database (implement your logic here)
    // Example: await saveUserToDatabase(newUser)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
  }
} 