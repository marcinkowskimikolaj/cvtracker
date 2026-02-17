export const APP_CONFIG = {
  oauthClientId: 'REPLACE_WITH_OAUTH_CLIENT_ID.apps.googleusercontent.com',
  configSpreadsheetId: 'REPLACE_WITH_CONFIG_SPREADSHEET_ID',
  allowedEmails: ['mikolaj@example.com', 'emilka@example.com'],
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
