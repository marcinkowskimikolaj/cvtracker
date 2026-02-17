export const APP_CONFIG = {
  oauthClientId: '78634531969-n4r32vmnr26pquifnudnrnqfqfevd4v8.apps.googleusercontent.com',
  configSpreadsheetId: 'REPLACE_WITH_CONFIG_SPREADSHEET_ID',
  allowedEmails: ['mikolo321@gmail.com', 'aemilka@gmail.com'],
  githubPagesBase: '/cvtracker/',
  oauthScopes: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar.events',
  ],
} as const
 
