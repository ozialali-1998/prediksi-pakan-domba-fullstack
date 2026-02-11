const { run, get } = require('./db');

const createPrediction = async ({ berat, umur, jumlah, feedType, result }) => {
  const insert = await run(
    `INSERT INTO Predictions (berat, umur, jumlah, feedType, result)
     VALUES (?, ?, ?, ?, ?)`,
    [berat, umur, jumlah, feedType, result]
  );

  return get('SELECT * FROM Predictions WHERE id = ?', [insert.id]);
};

module.exports = {
  createPrediction
};
