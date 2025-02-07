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

// Function to update referrer credits
export async function updateReferrerCredits() {
  try {
    console.log('[CRON] Running referrer credits update...');

    // Fetch all rows from the main sheet
    const mainSheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',
    });

    const mainSheetRows = mainSheetResponse.data.values || [];
    if (mainSheetRows.length === 0) {
      console.log('[CRON] No data found in main sheet');
      return;
    }

    // Check if Referral History sheet exists and has data
    let referralHistoryRows: any[][] = [];
    try {
      const referralHistoryResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'ReferralHistory!A:C',
      });
      referralHistoryRows = referralHistoryResponse.data.values || [];
    } catch (err) {
      console.log('[CRON] Referral History sheet not found or empty, creating initial history');
    }

    // If no referral history exists, create it from main sheet
    if (referralHistoryRows.length === 0) {
      const newReferralHistory: any[][] = [];
      
      // Add header row
      newReferralHistory.push(['Timestamp', 'Referrer ID', 'Referred User ID']);

      // Create history from existing referrals
      mainSheetRows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const referrerId = row[6]; // Column G (index 6)
        const referredUserId = row[0]; // Column A (index 0)
        if (referrerId) {
          newReferralHistory.push([
            new Date().toISOString(),
            referrerId,
            referredUserId
          ]);
        }
      });

      // Create the Referral History sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'ReferralHistory!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: newReferralHistory,
        },
      });

      console.log('[CRON] Created initial referral history');
      referralHistoryRows = newReferralHistory;
    }

    // Create a map to track new referrals since last update
    const newReferrals = new Map<string, number>();

    // Count how many times each referrer's ID appears in column B (Referrer ID)
    referralHistoryRows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const referrerId = row[1]; // Column B (index 1)
      if (referrerId) {
        // Only count new referrals (those with timestamps after the last update)
        const referralTimestamp = new Date(row[0]);
        if (referralTimestamp > lastUpdateTime) {
          newReferrals.set(referrerId, (newReferrals.get(referrerId) || 0) + 1);
        }
      }
    });

    // Update each referrer's credits
    for (const [referrerId, count] of newReferrals.entries()) {
      const referrerRow = mainSheetRows.find(row => row[0] === referrerId);
      if (referrerRow) {
        const currentCredits = parseInt(referrerRow[7], 10) || 0; // Column H (index 7)
        const newCredits = currentCredits + (count * 5);

        const rowNumber = mainSheetRows.findIndex(row => row[0] === referrerId) + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!H${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newCredits]],
          },
        });

        console.log(`Added ${count * 5} credits to referrer ${referrerId} (new total: ${newCredits})`);
      }
    }

    // Update the last update time
    lastUpdateTime = new Date();

    console.log('[CRON] Referrer credits update completed');
  } catch (err) {
    console.error('[CRON] Error updating referrer credits:', err);
  }
}

// Run the function every 30 seconds
setInterval(updateReferrerCredits, 30 * 1000); 