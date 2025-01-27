import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

// Clean and format the private key
const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '')
  .replace(/\\n/g, '\n')
  .replace(/"(.+)"/, '$1') // Remove any surrounding quotes

const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

// Add error handling for auth initialization
if (!auth) {
  console.error('Failed to initialize Google Sheets auth')
  throw new Error('Google Sheets authentication failed')
}

const sheets = google.sheets({ version: 'v4', auth })

// Add this after auth initialization
async function verifySheetSetup() {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    })
    
    console.log('Spreadsheet details:', {
      title: spreadsheet.data.properties?.title,
      sheets: spreadsheet.data.sheets?.map(s => s.properties?.title)
    })
  } catch (error) {
    console.error('Error verifying sheet setup:', error)
    throw error
  }
}

// Call this when initializing
verifySheetSetup()

const USERS_RANGE = {
  full: "Users!A:I",
  append: "Users!A1:I1",  // Explicitly specify starting cell
  read: "Users!A1:I"     // Include starting row
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  
  try {
    switch (action) {
      case 'getUser':
        const email = searchParams.get('email')
        const password = searchParams.get('password')
        return await handleGetUser(email!, password!)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...data } = body

    switch (action) {
      case 'addUser':
        return await handleAddUser(data)
      case 'updateEarnings':
        return await handleUpdateEarnings(data.userId, data.amount)
      case 'logOffer':
        return await handleLogOffer(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function handleGetUser(email: string, password: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: "Users!A:I",  // Basic format
  })

  const rows = response.data.values || []
  const user = rows.find(row => row[1] === email && row[2] === password)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user[0],
      email: user[1],
      password: user[2],
      firstName: user[3],
      lastName: user[4],
      referralCode: user[5],
      referredBy: user[6],
      credits: parseFloat(user[7]) || 0,
      createdAt: user[8]
    }
  })
}

async function handleAddUser(userData: any) {
  try {
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const now = new Date().toISOString()

    console.log('Adding user with data:', {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: USERS_RANGE.append,
      values: [
        Date.now().toString(),
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        referralCode,
        userData.referredBy || '',
        0,
        now
      ]
    })

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: USERS_RANGE.append,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          Date.now().toString(), // id
          userData.email,
          userData.password,
          userData.firstName,
          userData.lastName,
          referralCode,
          userData.referredBy || '',
          0, // initial credits
          now
        ]]
      }
    })

    console.log('Sheets API Response:', response)
    return NextResponse.json({ referralCode })
  } catch (error: any) {
    console.error('Error adding user:', {
      error: error.message,
      config: error.config,
      response: error.response?.data
    })
    throw error
  }
}

async function handleUpdateEarnings(userId: string, amount: number) {
  try {
    // First get current user data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Users!A:I"
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === userId)

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update credits
    const currentCredits = parseFloat(rows[rowIndex][7]) || 0
    const newCredits = currentCredits + amount

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `Users!H${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCredits]]
      }
    })

    return NextResponse.json({ credits: newCredits })
  } catch (error) {
    console.error('Error updating earnings:', error)
    throw error
  }
}

async function handleLogOffer(offerData: any) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Offers!A:E",
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          Date.now().toString(),
          offerData.userId,
          offerData.offerId,
          offerData.amount,
          new Date().toISOString()
        ]]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging offer:', error)
    throw error
  }
} 