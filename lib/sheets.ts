import { google } from 'googleapis'

export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

export const CREDENTIALS = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export async function getGoogleSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
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