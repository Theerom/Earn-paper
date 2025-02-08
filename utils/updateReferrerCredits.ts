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

export async function updateReferrerCredits() {
  try {
    console.log('[CRON] Running referrer credits update...');

    // Fetch referral history
    const referralHistoryResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ReferralHistory!A:C',
    });

    const referralHistoryRows = referralHistoryResponse.data.values || [];
    console.log(`Found ${referralHistoryRows.length} referral history entries`);

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

    console.log('[CRON] Referrer credits update completed');
  } catch (err) {
    console.error('[CRON] Error updating referrer credits:', err);
    throw err;
  }
}

// Run the function every 30 seconds
setInterval(updateReferrerCredits, 30 * 1000);