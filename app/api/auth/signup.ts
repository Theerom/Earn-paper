import { google } from 'googleapis'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { addReferralHistory } from '@/utils/updateReferrerCredits'

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

async function ensureReferralHistorySheetExists() {
  try {
    // Get all sheets in the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // Check if ReferralHistory sheet exists
    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === 'ReferralHistory'
    );

    if (!sheetExists) {
      console.log('ReferralHistory sheet not found, creating it...');
      
      // Create the sheet
      const createResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'ReferralHistory',
                gridProperties: {
                  rowCount: 1,
                  columnCount: 3
                }
              }
            }
          }]
        }
      });

      console.log('Sheet creation response:', createResponse.data);

      // Add headers
      const headerResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'ReferralHistory!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Timestamp', 'Referrer ID', 'Referred User ID']],
        },
      });

      console.log('Header update response:', headerResponse.data);
      console.log('Successfully created ReferralHistory sheet');
    } else {
      console.log('ReferralHistory sheet already exists');
    }
  } catch (err) {
    console.error('Error ensuring ReferralHistory sheet exists:', err);
    throw err;
  }
}

export async function handleSignup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  referralCode?: string
) {
  // Check if the email already exists
  const userResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:I', // Adjust the range as needed
  });

  const rows = userResponse.data.values || [];
  const emailExists = rows.some(row => row[1] === email); // Assuming email is in the second column (index 1)

  if (emailExists) {
    return { error: 'Email already exists' };
  }

  // Create new user
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Handle referral code logic
  let referredBy = '';
  if (referralCode) {
    try {
      // Find the referrer by their referral code
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:F',
      });

      const rows = response.data.values || [];
      const referrerRow = rows.find(row => row[5] === referralCode);

      if (referrerRow) {
        referredBy = referrerRow[0];
        console.log(`Found referrer: ${referredBy}`);

        // Add to referral history
        await addReferralHistory(referredBy, userId);
      }
    } catch (err) {
      console.error('Error processing referral:', err);
    }
  }

  const newUser = [
    userId, // Column A
    email.toLowerCase(), // Column B
    hashedPassword, // Column C
    firstName, // Column D
    lastName, // Column E
    Math.random().toString(36).substring(2, 8).toUpperCase(), // Column F
    referredBy, // Column G
    5, // Column H - Initial credits for new user
    new Date().toISOString() // Column I
  ];

  // Save new user to the Google Sheets
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newUser],
    },
  });

  // After creating the user, generate a JWT token
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

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
  };
}
