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

// Assuming you have a separate range for the Withdrawals sheet
const WITHDRAWALS_RANGE = 'Withdrawals!A:B'; // Adjust the range as needed

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    const userResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    })

    const rows = userResponse.data.values || []
    const userRow = rows.find((row: string[]) => row[0] === userId && row[1] === email)

    if (!userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the count of referrals based on the referredBy column
    const referralCount = rows.filter(row => row[6] === userId).length; // Assuming referredBy is in column 7 (index 6)

    // Fetch pending withdrawals from the Withdrawals sheet
    const withdrawalsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: WITHDRAWALS_RANGE,
    })

    const withdrawalsRows = withdrawalsResponse.data.values || []

    // Filter withdrawals for the specific user
    const userWithdrawals = withdrawalsRows.filter(row => row[0] === userId)

    // Calculate total withdrawals for the specific user
    const totalWithdrawals = userWithdrawals.reduce((total, row) => {
      return total + (parseFloat(row[1]) || 0)
    }, 0)

    // Get top 5 earners
    const topEarners = rows
      .map(row => ({
        id: row[0],
        name: `${row[3]} ${row[4]}`,
        earnings: parseFloat(row[7]) || 0,
        avatar: '/avatars/default.jpg'
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)

    const user = {
      id: userRow[0],
      email: userRow[1],
      firstName: userRow[3],
      lastName: userRow[4],
      referralCode: userRow[5],
      credits: parseFloat(userRow[7]) || 0,
      referrals: referralCount, // Set the referral count based on the new logic
      pendingWithdrawals: totalWithdrawals, // Add the total withdrawals to the user object
    }

    return NextResponse.json({ user, topEarners })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
} 