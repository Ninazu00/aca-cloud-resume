const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;
const appName = process.env.APP_NAME;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const visitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many requests' }
});

app.post('/api/visit', visitLimiter, async (req, res) => {
  try {
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const result = await pool.query('SELECT COUNT(*) AS total FROM visits');
    res.json({ count: result.rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/visits', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total FROM visits');
    res.json({ count: result.rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
  console.log(`Request served by ${appName}`);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`${appName} is listening on port ${port}`);
  });
}

module.exports = app;