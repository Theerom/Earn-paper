import { NextResponse } from 'next/server'
import { google } from 'googleapis'

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

export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I', // Adjust the range as needed
    })

    const rows = response.data.values || []
    console.log('Rows from spreadsheet:', rows); // Log the rows to see the data

    const earners = rows
      .map(row => ({
        name: `${row[2]} ${row[3]}`, // Assuming first name is in column 3 and last name in column 4
        earnings: parseFloat(row[7]) || 0, // Assuming earnings are in column 8
      }))
      .filter(earner => earner.earnings > 0) // Filter out earners with 0 earnings
      .sort((a, b) => b.earnings - a.earnings) // Sort by earnings descending

    const topEarners = earners.slice(0, 5) // Get top 5 earners
    console.log('Top earners:', topEarners); // Log the top earners

    return NextResponse.json({ topEarners })
  } catch (error) {
    console.error('Error fetching top earners:', error)
    return NextResponse.json({ error: 'Failed to fetch top earners' }, { status: 500 })
  }
} 