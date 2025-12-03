/**
 * Module transform for 'shop' module.
 * Exposes produceFiles(opts) that returns Promise<string[]> of local file paths.
 *
 * Behavior:
 *  - If GOOGLE_DRIVE_FOLDER_ID is set in env, will download any .json files in that Drive folder.
 *  - Saves to ./data/generated/ and returns list of downloaded files.
 *
 * Replace or extend produceFiles to generate files from DB or posted payloads.
 */

const fs = require('fs');
const path = require('path');
const { getDriveClient } = require('../../lib/drive-client');

const GENERATED_DIR = path.join(__dirname, '../../data/generated');
if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });

async function produceFiles(opts = {}) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    // No drive configured — nothing to produce
    return [];
  }

  const drive = await getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name)'
  });

  const downloaded = [];
  for (const file of res.data.files || []) {
    if (!file.name.toLowerCase().endsWith('.json')) continue;
    const dest = path.join(GENERATED_DIR, file.name);
    const destStream = fs.createWriteStream(dest);
    await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'stream' })
      .then(r => new Promise((resolve, reject) => {
        r.data.pipe(destStream)
          .on('finish', () => resolve())
          .on('error', reject);
      }));
    downloaded.push(dest);
  }

  return downloaded;
}

module.exports = { produceFiles };
