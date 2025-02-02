import { NextResponse } from 'next/server'
import { google } from 'googleapis'

// Your Google Sheets credentials and configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const reward = searchParams.get('reward')
    const status = searchParams.get('status')

    // Basic validation
    if (!user_id || !reward || status !== "completed") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
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
      range: 'Sheet1!A:C', // Adjust based on your sheet
    })

    const rows = response.data.values || []
    const userRow = rows.findIndex(row => row[0] === user_id)
    const currentCredits = userRow >= 0 ? parseFloat(rows[userRow][1]) || 0 : 0
    const newCredits = currentCredits + parseFloat(reward)

    if (userRow >= 0) {
      // Update existing user
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!B${userRow + 1}:C${userRow + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newCredits, new Date().toISOString()]]
        }
      })
    } else {
      // Add new user
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:C',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[user_id, newCredits, new Date().toISOString()]]
        }
      })
    }

    return NextResponse.json({ message: "Success" })
  } catch (error) {
    console.error("Error processing reward:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 