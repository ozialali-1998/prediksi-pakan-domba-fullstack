const express = require('express');
const {
  getAllFeedTypes,
  createFeedType
} = require('../models/feedTypeModel');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const feeds = await getAllFeedTypes();
    res.json({ success: true, data: feeds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data jenis pakan.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, protein, energy } = req.body;

    if (!name || protein === undefined || energy === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, protein, dan energi wajib diisi.' });
    }

    const proteinValue = Number(protein);
    const energyValue = Number(energy);

    if (Number.isNaN(proteinValue) || Number.isNaN(energyValue)) {
      return res.status(400).json({ success: false, message: 'Protein dan energi harus berupa angka.' });
    }

    const newFeed = await createFeedType({
      name: String(name).trim(),
      protein: proteinValue,
      energy: energyValue
    });

    res.status(201).json({ success: true, data: newFeed, message: 'Jenis pakan baru berhasil ditambahkan.' });
  } catch (error) {
    const isUniqueConstraint = String(error.message || '').includes('UNIQUE');
    if (isUniqueConstraint) {
      return res.status(409).json({ success: false, message: 'Nama pakan sudah ada, gunakan nama lain.' });
    }

    res.status(500).json({ success: false, message: 'Gagal menyimpan jenis pakan baru.' });
  }
});

module.exports = router;
