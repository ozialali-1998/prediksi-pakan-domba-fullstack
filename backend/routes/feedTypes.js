const express = require('express');
const { getAllFeedTypes } = require('../models/feedTypeModel');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const feedTypes = await getAllFeedTypes();
    res.json({ data: feedTypes });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil jenis pakan.' });
  }
});

module.exports = router;
