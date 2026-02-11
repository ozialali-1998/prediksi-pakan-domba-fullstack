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
      name TEXT NOT NULL UNIQUE,
      protein REAL NOT NULL,
      energy REAL NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      berat REAL NOT NULL,
      umur REAL NOT NULL,
      jumlah INTEGER NOT NULL,
      feedType TEXT NOT NULL,
      result REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const defaultFeedTypes = [
    { name: 'Complete Feed', protein: 16, energy: 2500 },
    { name: 'Breeding', protein: 18, energy: 2400 },
    { name: 'Fattening', protein: 14, energy: 2700 },
    { name: 'Silase', protein: 10, energy: 1800 }
  ];

  for (const feed of defaultFeedTypes) {
    await run(
      `INSERT OR IGNORE INTO FeedTypes (name, protein, energy) VALUES (?, ?, ?)`,
      [feed.name, feed.protein, feed.energy]
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
