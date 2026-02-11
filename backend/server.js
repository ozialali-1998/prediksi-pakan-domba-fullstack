const path = require('path');
const express = require('express');
const { initializeDatabase } = require('./models/db');
const feedTypesRoutes = require('./routes/feedTypes');
const { router: predictRoutes } = require('./routes/predict');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/feed-types', feedTypesRoutes);
app.use('/api/predict', predictRoutes);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server berjalan pada http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Gagal inisialisasi database:', error);
    process.exit(1);
  });
