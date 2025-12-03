require('dotenv').config();
const express = require('express');
const routes = require('./routes');

const app = express();
app.use(express.json());

// Load routes
app.use('/', routes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`GCAD Server running on http://localhost:${port}`);
});
