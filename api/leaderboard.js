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
  await client.query(`
    ALTER TABLE fuzzle_leaderboard
      ADD COLUMN IF NOT EXISTS game VARCHAR(20) NOT NULL DEFAULT 'fuzzle'
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_fuzzle_leaderboard_game_score
      ON fuzzle_leaderboard (game, score DESC)
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
      const game = req.query && req.query.game ? String(req.query.game).slice(0, 20) : null;
      const result = game
        ? await client.query(
            'SELECT id, name, score, difficulty, game, created_at FROM fuzzle_leaderboard WHERE LOWER(game) = LOWER($1) ORDER BY score DESC LIMIT 10',
            [game]
          )
        : await client.query(
            'SELECT id, name, score, difficulty, game, created_at FROM fuzzle_leaderboard ORDER BY score DESC LIMIT 10'
          );
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { name, score, difficulty, game } = req.body;

      if (!name || score == null || !difficulty) {
        return res.status(400).json({ error: 'name, score, and difficulty are required' });
      }

      const safeName = String(name).slice(0, 12);
      const safeScore = parseInt(score, 10);
      const safeDiff = String(difficulty).slice(0, 20);
      const safeGame = String(game || 'fuzzle').slice(0, 20);

      if (isNaN(safeScore)) {
        return res.status(400).json({ error: 'score must be a number' });
      }

      // Check if this name already has a score for the same game + difficulty
      const existing = await client.query(
        'SELECT id, score FROM fuzzle_leaderboard WHERE LOWER(name) = LOWER($1) AND LOWER(difficulty) = LOWER($2) AND LOWER(game) = LOWER($3)',
        [safeName, safeDiff, safeGame]
      );

      let result;
      if (existing.rows.length > 0 && safeScore > existing.rows[0].score) {
        result = await client.query(
          'UPDATE fuzzle_leaderboard SET score = $1, created_at = NOW() WHERE id = $2 RETURNING id, name, score, difficulty, game, created_at',
          [safeScore, existing.rows[0].id]
        );
      } else if (existing.rows.length > 0) {
        result = await client.query(
          'SELECT id, name, score, difficulty, game, created_at FROM fuzzle_leaderboard WHERE id = $1',
          [existing.rows[0].id]
        );
      } else {
        result = await client.query(
          'INSERT INTO fuzzle_leaderboard (name, score, difficulty, game) VALUES ($1, $2, $3, $4) RETURNING id, name, score, difficulty, game, created_at',
          [safeName, safeScore, safeDiff, safeGame]
        );
      }

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
