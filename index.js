/**
 * GameWeenies Cobblemon Adventure Dashboard - Starter (Option B)
 * Main server: loads modules, registers endpoints, serves UI.
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// load config
const CONFIG_PATH = path.join(__dirname, 'config.json');
if (!fs.existsSync(CONFIG_PATH)) {
  console.error('Missing config.json - create one from the template');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(CONFIG_PATH));

// logging helper
function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  if (config.logging && config.logging.logFile) {
    fs.appendFileSync(config.logging.logFile, `[${ts}] ${msg}\n`);
  }
}

log(`${config.appName} starting...`);

// load modules (modules/<name>/schema.json + optional transforms.js)
const MODULES_DIR = path.join(__dirname, 'modules');
const modules = {};

if (fs.existsSync(MODULES_DIR)) {
  for (const name of fs.readdirSync(MODULES_DIR)) {
    const modPath = path.join(MODULES_DIR, name);
    if (!fs.statSync(modPath).isDirectory()) continue;
    try {
      const schemaPath = path.join(modPath, 'schema.json');
      const transformsPath = path.join(modPath, 'transforms.js');
      const schema = fs.existsSync(schemaPath) ? JSON.parse(fs.readFileSync(schemaPath)) : null;
      const transforms = fs.existsSync(transformsPath) ? require(transformsPath) : {};
      modules[name] = { name, path: modPath, schema, transforms };
      log(`Loaded module: ${name}`);
    } catch (e) {
      log(`Failed to load module ${name}: ${e.message}`);
    }
  }
} else {
  log('No modules directory found (create modules/shop etc.)');
}

// load drivers
const drivers = {
  local: require('./sync/local'),
  sftp: require('./sync/sftp')
};

// resolve a target (fill pass from env if passEnv present)
function resolveTarget(targetKey) {
  const t = config.targets[targetKey];
  if (!t) return null;
  const resolved = JSON.parse(JSON.stringify(t)); // shallow clone
  if (resolved.passEnv && process.env[resolved.passEnv]) {
    resolved.pass = process.env[resolved.passEnv];
  }
  return resolved;
}

// register endpoints as configured
for (const ep of config.endpoints || []) {
  const expressPath = ep.path;
  const moduleName = ep.module;
  const defaultTarget = ep.defaultTarget;

  if (!modules[moduleName]) {
    log(`Configured endpoint ${expressPath} references missing module ${moduleName}`);
    continue;
  }

  app.post(expressPath, async (req, res) => {
    log(`Endpoint hit: ${expressPath}`);
    const body = req.body || {};
    const files = body.files || []; // optional: list of local files to upload
    const targetKey = body.target || defaultTarget;
    const target = resolveTarget(targetKey);

    if (!target) {
      res.status(400).json({ error: 'Missing or invalid target' });
      return;
    }
    const driverName = target.driver || 'sftp';
    const driver = drivers[driverName];
    if (!driver) {
      res.status(500).json({ error: 'Unknown driver: ' + driverName });
      return;
    }

    const moduleObj = modules[moduleName];

    try {
      // if no 'files' supplied, try module.produceFiles (e.g. download from Drive or generate)
      let localFiles = files;
      if ((!localFiles || localFiles.length === 0) && moduleObj.transforms && moduleObj.transforms.produceFiles) {
        localFiles = await moduleObj.transforms.produceFiles({ module: moduleObj, config, env: process.env });
      }

      if (!localFiles || localFiles.length === 0) {
        res.status(400).json({ error: 'No files to sync' });
        return;
      }

      // upload each file via driver
      const uploaded = [];
      for (const f of localFiles) {
        log(`Uploading ${f} → target ${targetKey} using ${driverName}`);
        const remotePath = await driver.upload(f, target);
        uploaded.push(remotePath);
      }

      res.json({ status: 'ok', uploaded });
    } catch (err) {
      log(`Error in endpoint ${expressPath}: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  log(`Registered endpoint ${expressPath} -> module ${moduleName}`);
}

// simple API: list modules & schemas
app.get('/api/modules', (req, res) => {
  const list = Object.values(modules).map(m => ({ name: m.name, hasSchema: !!m.schema }));
  res.json(list);
});

// get single module schema
app.get('/api/modules/:name/schema', (req, res) => {
  const m = modules[req.params.name];
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m.schema || {});
});

// health
app.get('/health', (req, res) => res.send('OK'));

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => log(`Server listening on ${PORT}`));
