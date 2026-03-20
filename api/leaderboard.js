const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS fuzzle_leaderboard (
      id SERIAL PRIMARY KEY,
      name VARCHAR(12) NOT NULL,
      score INTEGER NOT NULL,
      difficulty VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool();
  const client = await db.connect();

  try {
    await ensureTable(client);

    if (req.method === 'GET') {
      const result = await client.query(
        'SELECT id, name, score, difficulty, created_at FROM fuzzle_leaderboard ORDER BY score DESC LIMIT 10'
      );
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { name, score, difficulty } = req.body;

      if (!name || score == null || !difficulty) {
        return res.status(400).json({ error: 'name, score, and difficulty are required' });
      }

      const safeName = String(name).slice(0, 12);
      const safeScore = parseInt(score, 10);
      const safeDiff = String(difficulty).slice(0, 20);

      if (isNaN(safeScore)) {
        return res.status(400).json({ error: 'score must be a number' });
      }

      const result = await client.query(
        'INSERT INTO fuzzle_leaderboard (name, score, difficulty) VALUES ($1, $2, $3) RETURNING id, name, score, difficulty, created_at',
        [safeName, safeScore, safeDiff]
      );

      return res.json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
