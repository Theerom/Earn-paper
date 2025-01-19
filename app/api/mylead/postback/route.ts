import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const amount = searchParams.get('amount')
    
    if (!userId || !amount) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

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
    const userRowIndex = rows.findIndex(row => row[0] === userId)

    if (userRowIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user's credits
    const currentCredits = parseFloat(rows[userRowIndex][7]) || 0
    const newCredits = currentCredits + parseFloat(amount)

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!H${userRowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCredits]]
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Credits updated successfully"
    })
  } catch {
    return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
  }
} 