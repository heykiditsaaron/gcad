const fs = require('fs-extra');
const path = require('path');

async function uploadShops() {
  const shopFolder = path.join(__dirname, '../shops'); // Example local folder
  const files = await fs.readdir(shopFolder);

  console.log(`Found ${files.length} shop files to upload.`);

  for (const file of files) {
    const filePath = path.join(shopFolder, file);
    console.log(`Uploading: ${filePath}`);
    // TODO: Add SFTP / FTP upload logic here
  }

  return `${files.length} files processed`;
}

module.exports = { uploadShops };
