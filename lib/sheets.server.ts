import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
})

export const sheets = google.sheets({ version: 'v4', auth }) 