import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export async function GET() {
  try {
    // Log environment variables (without private key)
    console.log('Spreadsheet ID:', SPREADSHEET_ID)
    console.log('Client Email:', CREDENTIALS.client_email)
    console.log('Has Private Key:', !!CREDENTIALS.private_key)

    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    return NextResponse.json({ 
      message: "Connected successfully",
      rows: response.data.values?.length || 0,
      sheetInfo: response.data
    })
  } catch (error) {
    console.error("Test error details:", error)
    return NextResponse.json({ 
      error: "Connection failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 