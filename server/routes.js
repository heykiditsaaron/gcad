const express = require('express');
const router = express.Router();
const sync = require('./sync');

// Example endpoint to trigger sync
router.post('/shop-sync', async (req, res) => {
  try {
    const result = await sync.uploadShops();
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
