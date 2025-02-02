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
  let referredBy = '' // Default to empty
  if (referralCode) {
    // Check if the referral code exists
    const referrerRow = rows.find(row => row[5] === referralCode) // Assuming referral code is in the sixth column
    if (referrerRow) {
      referredBy = referrerRow[0] // Set referredBy to the ID of the referrer
    }
  }

  const newUser = [
    userId, // ID
    email.toLowerCase(), // Email
    hashedPassword, // Password (hashed)
    firstName, // First Name
    lastName, // Last Name
    newReferralCode, // Referral Code
    referredBy, // Referred By (ID of the referrer)
    5, // Initial Credits (this is where we assign $5)
    new Date().toISOString() // Created At Timestamp
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

  // Check if there is a referrer and update their credits
  if (referredBy) {
    console.log(`Referred By ID: ${referredBy}`); // Log the referredBy ID
    const referrerRow = rows.find(row => row[0] === referredBy); // Assuming ID is in the first column
    if (referrerRow) {
      const referrerCredits = parseInt(referrerRow[7], 10) || 0; // Assuming credits are in the eighth column
      console.log(`Current Referrer Credits: ${referrerCredits}`); // Log current credits
      const updatedCredits = referrerCredits + 5;

      // Update the referrer's credits in Google Sheets
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!A${rows.indexOf(referrerRow) + 2}:I${rows.indexOf(referrerRow) + 2}`, // Adjusting for 1-based index
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            referrerRow[0], // ID
            referrerRow[1], // Email
            referrerRow[2], // Password (hashed)
            referrerRow[3], // First Name
            referrerRow[4], // Last Name
            referrerRow[5], // Referral Code
            referrerRow[6], // Referred By
            updatedCredits,  // Updated Credits
            referrerRow[8]   // Created At Timestamp
          ]], // Update only credits
        },
      });
      console.log(`Updated Referrer Credits: ${updatedCredits}`); // Log updated credits
    } else {
      console.log(`Referrer not found for ID: ${referredBy}`); // Log if referrer is not found
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
