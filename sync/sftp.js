/**
 * SFTP driver using ssh2-sftp-client
 */
const Client = require('ssh2-sftp-client');
const path = require('path');

module.exports.upload = async function (localPath, target) {
  const sftp = new Client();
  const connectCfg = {
    host: target.host,
    port: target.port || 22,
    username: target.user,
    password: target.pass
    // optionally add privateKey: target.privateKey
  };

  try {
    await sftp.connect(connectCfg);
    try {
      await sftp.mkdir(target.remotePath, true); // recursive
    } catch (e) {
      // ignore if exists
    }
    const remoteFile = path.posix.join(target.remotePath, path.basename(localPath));
    await sftp.put(localPath, remoteFile);
    await sftp.end();
    return remoteFile;
  } catch (err) {
    try { await sftp.end(); } catch (e) {}
    throw err;
  }
};
