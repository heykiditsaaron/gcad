/**
 * Local driver: copies a local file to a local target directory.
 * Useful for testing without real SFTP.
 */
const fs = require('fs');
const path = require('path');

module.exports.upload = async function (localPath, target) {
  const destDir = path.resolve(target.remotePath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, path.basename(localPath));
  fs.copyFileSync(localPath, destPath);
  return destPath;
};
