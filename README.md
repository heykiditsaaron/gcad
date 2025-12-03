📘 GameWeenies Cobblemon Adventure Dashboard (GCAD)

A modular, scalable management dashboard for Cobblemon servers and advanced Minecraft modded gameplay.

🌟 Overview

The GameWeenies Cobblemon Adventure Dashboard (GCAD) is a next-generation configuration and deployment system designed to simplify the management of complex JSON-based data used by Cobblemon, Minecraft servers, and AMP-managed environments.

This tool replaces multi-step workflows (Google Sheets → Google Drive → Node App → FTP → Server) with a centralized dashboard that can:

Edit, preview, validate, and sync shop configs

Manage NPC interactions and dialogues

Organize loot tables and item definitions

Deploy updates directly to AMP game servers

Support new modules as your server grows

It is scalable, modular, and designed specifically for long-term expansion.

🚀 Features
🎨 Interactive Dashboard

Modern web UI (React/SvelteKit depending on your implementation)

Live previews (shops, dialogues, items)

Visual editors for JSON structures

Dark/light theme support

🔧 Modular Plug-In System

Create “modules” that add:

New editors

New UI panels

New JSON schema definitions

New sync pipelines

Custom validation rules

Example modules:

Shop Editor Module

NPC Dialogue Module

Loot Table Module

Quest / Adventure Module (future)

Config File Manager

Server Control Panel Extensions

📂 Server Sync Engine

Sync configurations directly to AMP instances

Supports:

Local filesystem sync

SFTP/FTPS

Custom endpoints

Multi-server support via endpoint mapping

One-click deploy

⚙️ Template-Based Editing

Templates for common Cobblemon or Minecraft config structures

User-defined templates

Module-defined templates

📦 Import/Export Tools

Import JSON/YAML/TOML

Export for backup or deployments

Automatic validation and formatting

🔐 Credential Isolation

All sensitive data stored in a secure .env file

Supports environment variables for multi-instance deployments

🏗️ Architecture Overview
GameWeenies Cobblemon Adventure Dashboard (GCAD)
│
├── /server
│   ├── Express/Fastify backend
│   ├── Sync engine (filesystem, SFTP, AMP endpoints)
│   ├── Module loader
│   ├── Auth middleware (optional)
│   └── JSON/YAML validation layer
│
├── /client
│   ├── React/SvelteKit UI
│   ├── Dynamic module-driven panels
│   └── Live preview components
│
├── /modules
│   ├── shop-editor/
│   ├── npc-dialogue/
│   ├── loot-tables/
│   └── your-custom-module-here/
│
└── /config
    ├── endpoints.json   → maps dashboard routes to servers
    ├── modules.json     → enables modules
    └── templates/       → template definitions

📦 Installation
1. Clone the repository
git clone https://github.com/your/repo.git
cd gcad

2. Install dependencies
npm install

3. Create .env
PORT=3000

# Google API (if you still use Drive syncing)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_FOLDER_ID=

# AMP / SFTP / Deployment
AMP_HOST=
AMP_USER=
AMP_PASSWORD=

4. Start the dashboard
npm run dev

🔧 Configuration
config/endpoints.json

Maps dashboard actions to server upload targets.

{
  "/sync/shops": {
    "type": "sftp",
    "host": "192.168.1.100",
    "port": 22,
    "user": "amp",
    "password": "yourpass",
    "remotePath": "/home/amp/.ampdata/instances/cobblemon/Shops"
  }
}

config/modules.json

Controls which modules are active.

{
  "shopEditor": true,
  "npcDialogues": true,
  "lootTables": false
}

🧩 Creating Modules

Modules live in /modules and expose:

A UI component

A backend handler

A schema

Optional sync logic

Example structure:

modules/shop-editor/
│
├── schema.json
├── ui-panel.jsx
├── sync.js
└── module.json


You can add new modules without modifying core code.

🔐 Security

Credentials stored only in .env

Server-side sync only

Optional authentication middleware

No sensitive data exposed to browser

🧪 Testing
npm run test

📄 License

This project is licensed under the MIT License.
See LICENSE for details.

🤝 Contributing

Fork the repository

Create a new feature branch

Ensure modules are isolated and documented

Submit a pull request

❤️ Credits

Developed for GameWeenies Cobblemon Adventure Server
Inspired by the need for a scalable, user-friendly system for managing advanced modded Minecraft configurations.