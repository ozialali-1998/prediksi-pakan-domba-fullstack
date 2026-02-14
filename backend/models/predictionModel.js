const { all, run } = require('./db');

const getHistoricalByFeedTypeBeforeMonth = (feedType, month) =>
  all(
    `SELECT month, jumlah, konsumsi, actualNeed
     FROM HistoricalData
     WHERE LOWER(feedType) = LOWER(?) AND month < ?
     ORDER BY month ASC`,
    [feedType, month]
  );

const createPrediction = async ({ bulan, jumlah, konsumsi, feedType, prediksi, mape, interpretasi }) => {
  await run(
    `INSERT INTO Predictions (bulan, jumlah, konsumsi, feedType, prediksi, mape, interpretasi)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [bulan, jumlah, konsumsi, feedType, prediksi, mape, interpretasi]
  );
};

module.exports = {
  getHistoricalByFeedTypeBeforeMonth,
  createPrediction
};
