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

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string }
    const { amount, paymentMethod, paymentDetails } = await request.json()

    // Initialize Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Get user's current credits
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = response.data.values || []
    const userRowIndex = rows.findIndex(row => row[0] === decoded.userId)

    if (userRowIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentCredits = parseFloat(rows[userRowIndex][7]) || 0
    if (currentCredits < amount) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    // Update user's credits
    const newCredits = currentCredits - amount
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!H${userRowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCredits]]
      }
    })

    // Add withdrawal record to a new "Withdrawals" sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Withdrawals!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          decoded.userId,
          amount,
          paymentMethod,
          paymentDetails,
          new Date().toISOString()
        ]]
      }
    })

    return NextResponse.json({ 
      message: "Withdrawal processed successfully",
      newBalance: newCredits
    })
  } catch {
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 })
  }
} 