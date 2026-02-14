const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../database/database.sqlite');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const initializeDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS FeedTypes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS HistoricalData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL,
      jumlah INTEGER NOT NULL,
      konsumsi REAL NOT NULL,
      feedType TEXT NOT NULL,
      actualNeed REAL NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bulan INTEGER NOT NULL,
      jumlah INTEGER NOT NULL,
      konsumsi REAL NOT NULL,
      feedType TEXT NOT NULL,
      prediksi REAL NOT NULL,
      mape REAL NOT NULL,
      interpretasi TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const feedTypes = ['Fattening', 'Breeding', 'Silase', 'Complete'];
  for (const name of feedTypes) {
    await run('INSERT OR IGNORE INTO FeedTypes (name) VALUES (?)', [name]);
  }

  const historyCount = await get('SELECT COUNT(*) AS total FROM HistoricalData');
  if (historyCount.total > 0) return;

  const historicalSeed = [
    // Fattening
    [1, 20, 1.9, 'Fattening', 40],
    [2, 22, 2.0, 'Fattening', 44],
    [3, 24, 2.1, 'Fattening', 48],
    [4, 25, 2.2, 'Fattening', 51],
    [5, 26, 2.3, 'Fattening', 54],
    [6, 27, 2.4, 'Fattening', 57],
    // Breeding
    [1, 15, 1.7, 'Breeding', 27],
    [2, 16, 1.8, 'Breeding', 30],
    [3, 18, 1.9, 'Breeding', 33],
    [4, 19, 2.0, 'Breeding', 36],
    [5, 20, 2.1, 'Breeding', 39],
    [6, 21, 2.2, 'Breeding', 42],
    // Silase
    [1, 18, 1.5, 'Silase', 25],
    [2, 19, 1.6, 'Silase', 27],
    [3, 20, 1.7, 'Silase', 29],
    [4, 21, 1.8, 'Silase', 31],
    [5, 22, 1.9, 'Silase', 33],
    [6, 23, 2.0, 'Silase', 35],
    // Complete
    [1, 17, 1.8, 'Complete', 31],
    [2, 18, 1.9, 'Complete', 33],
    [3, 19, 2.0, 'Complete', 35],
    [4, 20, 2.1, 'Complete', 37],
    [5, 21, 2.2, 'Complete', 39],
    [6, 22, 2.3, 'Complete', 41]
  ];

  for (const row of historicalSeed) {
    await run(
      'INSERT INTO HistoricalData (month, jumlah, konsumsi, feedType, actualNeed) VALUES (?, ?, ?, ?, ?)',
      row
    );
  }
};

module.exports = {
  db,
  run,
  get,
  all,
  initializeDatabase
};
