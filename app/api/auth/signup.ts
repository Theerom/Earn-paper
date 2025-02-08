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
      console.log(`Processing referral code: ${referralCode}`);
      
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
        const referralEntry = [
          new Date().toISOString(),
          referredBy,
          userId
        ];

        console.log('Adding to referral history:', referralEntry);
        
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'ReferralHistory!A:C',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [referralEntry],
          },
        });

        // Immediately update referrer's credits
        const referrerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Sheet1!A:I',
        });

        const referrerRows = referrerResponse.data.values || [];
        const referrerDataRow = referrerRows.find(row => row[0] === referredBy);

        if (referrerDataRow) {
          const currentCredits = parseInt(referrerDataRow[7], 10) || 0;
          const newCredits = currentCredits + 5;
          const rowNumber = referrerRows.findIndex(row => row[0] === referredBy) + 2;

          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Sheet1!H${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[newCredits]],
            },
          });

          console.log(`Immediately updated credits for referrer ${referredBy} to ${newCredits}`);
        }
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
