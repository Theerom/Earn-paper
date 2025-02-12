import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Function to ensure ReferralHistory sheet exists
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

// Function to add referral history
export async function addReferralHistory(referrerId: string, referredUserId: string) {
  try {
    // Ensure the ReferralHistory sheet exists
    await ensureReferralHistorySheetExists();

    const referralEntry = [
      new Date().toISOString(), // Column A: Timestamp
      referrerId,               // Column B: Referrer ID
      referredUserId            // Column C: Referred User ID
    ];

    console.log('Adding to referral history:', referralEntry);
    
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ReferralHistory!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [referralEntry],
      },
    });

    console.log('Append response:', appendResponse.data);
    console.log('Successfully added to referral history');
  } catch (err) {
    console.error('Error adding referral history:', err);
    throw err;
  }
}

// Function to update referrer credits
export async function updateReferrerCredits() {
  try {
    console.log('Updating referrer credits...');

    // Ensure the ReferralHistory sheet exists
    await ensureReferralHistorySheetExists();

    // Fetch referral history
    const referralHistoryResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ReferralHistory!A:C',
    });

    const referralHistoryRows = referralHistoryResponse.data.values || [];

    // Fetch all users
    const usersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    });

    const usersRows = usersResponse.data.values || [];

    // Create a map of referrer IDs to their referral counts
    const referralCounts = new Map<string, number>();
    referralHistoryRows.forEach((row, index) => {
      if (index === 0) return; // Skip header
      const referrerId = row[1];
      if (referrerId) {
        referralCounts.set(referrerId, (referralCounts.get(referrerId) || 0) + 1);
      }
    });

    // Update each referrer's credits
    for (const [referrerId, count] of referralCounts.entries()) {
      const referrerRow = usersRows.find(row => row[0] === referrerId);
      if (referrerRow) {
        const currentCredits = parseInt(referrerRow[7], 10) || 0;
        const newCredits = count * 5;
        const rowNumber = usersRows.findIndex(row => row[0] === referrerId) + 2;

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!H${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newCredits]],
          },
        });

        console.log(`Updated credits for referrer ${referrerId} to ${newCredits}`);
      }
    }

    console.log('Referrer credits update completed');
  } catch (err) {
    console.error('Error updating referrer credits:', err);
    throw err;
  }
}

// Run the function every 30 seconds
setInterval(updateReferrerCredits, 30 * 1000);