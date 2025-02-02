import { google } from 'googleapis'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function handleSignup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  referralCode?: string // Optional parameter
) {
  // Check if the email already exists
  const userResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:I', // Adjust the range as needed
  })

  const rows = userResponse.data.values || []
  const emailExists = rows.some(row => row[1] === email) // Assuming email is in the second column (index 1)

  if (emailExists) {
    return { error: 'Email already exists' }
  }

  // Create new user
  const userId = uuidv4()
  const hashedPassword = await bcrypt.hash(password, 10)
  const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  // Prepare the new user data
  let referredBy = '' // This will go in column G of the new user
  if (referralCode) {
    // Find the referrer by their referral code
    const referrerRow = rows.find(row => row[5] === referralCode); // Column F (index 5) contains referral codes
    if (referrerRow) {
      referredBy = referrerRow[0]; // Column A (index 0) contains the referrer's ID
    }
  }

  const newUser = [
    userId, // Column A
    email.toLowerCase(), // Column B
    hashedPassword, // Column C
    firstName, // Column D
    lastName, // Column E
    newReferralCode, // Column F
    referredBy, // Column G - Referrer's ID
    5, // Column H - Initial credits for new user
    new Date().toISOString() // Column I
  ]

  // Save new user to the Google Sheets
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newUser],
    },
  })

  // Update referrer's credits if applicable
  if (referredBy) {
    try {
      // Fetch fresh data for the referrer
      const referrerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:I',
      });

      const referrerRows = referrerResponse.data.values || [];
      const referrerRow = referrerRows.find(row => row[0] === referredBy); // Find by ID in column A

      if (referrerRow) {
        // Get current credits from column H (index 7)
        const currentCredits = parseInt(referrerRow[7], 10) || 0;
        const newCredits = currentCredits + 5;

        // Find the row number (1-based index)
        const rowNumber = referrerRows.findIndex(row => row[0] === referredBy) + 2;

        // Update only the credits column (H)
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!H${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newCredits]],
          },
        });

        console.log(`Successfully added 5 credits to referrer ${referredBy}`);
      } else {
        console.log(`Referrer with ID ${referredBy} not found`);
      }
    } catch (err) {
      console.error('Error updating referrer credits:', err);
    }
  }

  // After creating the user, generate a JWT token
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

  return {
    message: "Account created successfully",
    user: {
      id: userId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      credits: 5 // Set initial credits
    },
    token // Return the token for authentication
  }
}
