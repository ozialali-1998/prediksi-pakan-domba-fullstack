const express = require('express');
const { getFeedTypeByName } = require('../models/feedTypeModel');
const {
  getHistoricalByFeedTypeBeforeMonth,
  createPrediction
} = require('../models/predictionModel');
const {
  trainMultipleLinearRegression,
  predictValue,
  calculateMape,
  interpretMape
} = require('../services/regressionService');

const router = express.Router();

const json = (res, statusCode, payload) => res.status(statusCode).type('application/json').json(payload);

router.post('/', async (req, res) => {
  try {
    const { bulan, jumlahDomba, konsumsiPakan, jenisPakan } = req.body;

    const parsedBulan = Number(bulan);
    const parsedJumlah = Number(jumlahDomba);
    const parsedKonsumsi = Number(konsumsiPakan);

    if (!jenisPakan || [parsedBulan, parsedJumlah, parsedKonsumsi].some(Number.isNaN)) {
      return json(res, 400, {
        message: 'Parameter wajib: bulan, jumlahDomba, konsumsiPakan, jenisPakan.'
      });
    }

    const feedType = await getFeedTypeByName(jenisPakan);
    if (!feedType) {
      return json(res, 400, { message: 'Jenis pakan tidak valid.' });
    }

    const historicalRows = await getHistoricalByFeedTypeBeforeMonth(feedType.name, parsedBulan);
    if (historicalRows.length < 4) {
      return json(res, 400, {
        message: 'Data historis belum cukup. Minimal 4 data bulan sebelumnya untuk jenis pakan ini.'
      });
    }

    const beta = trainMultipleLinearRegression(historicalRows);
    const prediksi = predictValue(beta, {
      month: parsedBulan,
      jumlah: parsedJumlah,
      konsumsi: parsedKonsumsi
    });

    const mape = calculateMape(historicalRows, beta);
    const interpretasi = interpretMape(mape);

    await createPrediction({
      bulan: parsedBulan,
      jumlah: parsedJumlah,
      konsumsi: parsedKonsumsi,
      feedType: feedType.name,
      prediksi,
      mape,
      interpretasi
    });

    return json(res, 200, { prediksi, mape, interpretasi });
  } catch (error) {
    return json(res, 500, { message: 'Terjadi kesalahan saat proses prediksi.' });
  }
});

router.all('/', (req, res) => json(res, 405, { message: 'Method tidak diizinkan. Gunakan POST /prediksi.' }));

module.exports = router;
