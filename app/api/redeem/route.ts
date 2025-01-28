import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string }
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get request data
    const { amount, paymentMethod, paymentDetails } = await request.json()

    if (!amount || !paymentMethod || !paymentDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current user data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = response.data.values || []
    const userRowIndex = rows.findIndex(row => row[0] === decoded.userId)

    if (userRowIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentCredits = parseFloat(rows[userRowIndex][7]) || 0
    const newCredits = currentCredits - amount

    if (newCredits < 0) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Update user's credits
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!H${userRowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCredits.toString()]]
      }
    })

    // Record withdrawal request
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Withdrawals!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          decoded.userId,
          amount.toString(),
          paymentMethod,
          paymentDetails,
          new Date().toISOString(),
          'Pending'
        ]]
      }
    })

    return NextResponse.json({ 
      success: true,
      newBalance: newCredits
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
  }
} 