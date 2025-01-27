import { sheets } from './sheets.server'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const SHEET_ID = 'YOUR_SHEET_ID' // Replace with your Google Sheet ID

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
})

const sheets = google.sheets({ version: 'v4', auth })

export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

export const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export async function getGoogleSheets() {
  return sheets
}

export interface SheetUser {
  id: string;
  email: string;
  password: string; // Will be hashed
  firstName: string;
  lastName: string;
  referralCode: string;
  referredBy?: string;
  credits: number;
  createdAt: string;
}

export async function getUser(email: string, password: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Users!A:F',
    })

    const rows = response.data.values
    if (!rows) return null

    return rows.find(row => row[1] === email && row[2] === password)
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function addUser(userData: {
  username: string;
  email: string;
  password: string;
  referralCode: string;
}) {
  try {
    const referrer = await validateReferralCode(userData.referralCode)
    if (!referrer) throw new Error('Invalid referral code')

    const newReferralCode = generateUniqueReferralCode()
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Users!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          userData.username,
          userData.email,
          userData.password,
          newReferralCode,
          0, // initial earnings
          new Date().toISOString()
        ]]
      }
    })

    return newReferralCode
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

interface OfferCompletion {
  userId: string
  offerId: string
  offerName: string
  payout: number
  transactionId: string
  completedAt: string
}

export async function logOfferCompletion(offer: OfferCompletion) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Offers!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          offer.userId,
          offer.offerId,
          offer.offerName,
          offer.payout,
          offer.transactionId,
          offer.completedAt
        ]]
      }
    })
  } catch (error) {
    console.error('Error logging offer:', error)
    throw error
  }
}

export async function updateEarnings(userId: string, amount: number) {
  try {
    // Get current user data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Users!A:E',
    })

    const users = response.data.values
    const userRowIndex = users?.findIndex(row => row[0] === userId)

    if (userRowIndex === -1) {
      throw new Error('User not found')
    }

    // Update earnings
    const currentEarnings = parseFloat(users![userRowIndex][4]) || 0
    const newEarnings = currentEarnings + amount

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `Users!E${userRowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newEarnings]]
      }
    })

    return newEarnings
  } catch (error) {
    console.error('Error updating earnings:', error)
    throw error
  }
} 