const express = require('express');
const { getFeedTypeById } = require('../models/feedTypeModel');
const { createPrediction } = require('../models/predictionModel');

const router = express.Router();

const calculatePrediction = ({ berat, umur, jumlah, protein, energy }) => {
  // y = b0 + b1*berat + b2*umur + b3*jumlah + b4*protein + b5*energy
  // Coefficients are configurable constants from baseline domain assumptions.
  const b0 = 5;
  const b1 = 0.25;
  const b2 = 0.1;
  const b3 = 0.5;
  const b4 = 1.2;
  const b5 = 0.003;

  const value = b0 + b1 * berat + b2 * umur + b3 * jumlah + b4 * protein + b5 * energy;
  return Number(value.toFixed(2));
};

router.post('/', async (req, res) => {
  try {
    const { berat, umur, jumlah, feedTypeId } = req.body;

    const parsedBerat = Number(berat);
    const parsedUmur = Number(umur);
    const parsedJumlah = Number(jumlah);
    const parsedFeedTypeId = Number(feedTypeId);

    if ([parsedBerat, parsedUmur, parsedJumlah, parsedFeedTypeId].some((val) => Number.isNaN(val))) {
      return res.status(400).json({ success: false, message: 'Semua input harus berupa angka yang valid.' });
    }

    const feedType = await getFeedTypeById(parsedFeedTypeId);
    if (!feedType) {
      return res.status(404).json({ success: false, message: 'Jenis pakan tidak ditemukan.' });
    }

    const result = calculatePrediction({
      berat: parsedBerat,
      umur: parsedUmur,
      jumlah: parsedJumlah,
      protein: Number(feedType.protein),
      energy: Number(feedType.energy)
    });

    const savedPrediction = await createPrediction({
      berat: parsedBerat,
      umur: parsedUmur,
      jumlah: parsedJumlah,
      feedType: feedType.name,
      result
    });

    res.json({
      success: true,
      data: {
        prediction: result,
        feedType,
        record: savedPrediction
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghitung prediksi.' });
  }
});

module.exports = { router, calculatePrediction };
