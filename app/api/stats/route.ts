import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import type { TopEarner, EarningsData } from '@/app/types'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = response.data.values || []
    
    // Calculate top earners (excluding header row)
    const topEarners: TopEarner[] = rows.slice(1)
      .map(row => ({
        id: row[0],
        name: `${row[3]} ${row[4]}`,
        earnings: parseFloat(row[7]) || 0,
        avatar: `/avatars/default.jpg`
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)
      .map(user => ({
        ...user,
        earnings: user.earnings * 100
      }))

    return NextResponse.json({
      topEarners,
      earningsData: [
        { name: 'Jan', earnings: 400 },
        { name: 'Feb', earnings: 300 },
        { name: 'Mar', earnings: 550 },
        { name: 'Apr', earnings: 450 },
        { name: 'May', earnings: 600 },
        { name: 'Jun', earnings: 750 },
      ] as EarningsData[]
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
} 