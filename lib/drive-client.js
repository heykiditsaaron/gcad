/**
 * Simple Google Drive client (service account) — used by module transforms that want to download Drive files.
 */
const { google } = require('googleapis');
const fs = require('fs');

async function getDriveClient() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!keyFile || !fs.existsSync(keyFile)) throw new Error('Missing service account key file (set GOOGLE_SERVICE_ACCOUNT)');
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  return google.drive({ version: 'v3', auth });
}

module.exports = { getDriveClient };
