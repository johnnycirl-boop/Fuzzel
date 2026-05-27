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
    CREATE TABLE IF NOT EXISTS fuzzle_words (
      id SERIAL PRIMARY KEY,
      clue_word VARCHAR(30) NOT NULL,
      mystery_word VARCHAR(10) NOT NULL,
      category VARCHAR(30) NOT NULL,
      connection VARCHAR(100) NOT NULL
    )
  `);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = getPool();
  const client = await db.connect();

  try {
    await ensureTable(client);

    // How many words to return (default 10, max 50)
    const count = Math.min(parseInt(req.query.count) || 10, 50);

    // Optional: exclude specific IDs the client already used this session
    const excludeParam = req.query.exclude || '';
    const excludeIds = excludeParam
      .split(',')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    let result;
    if (excludeIds.length > 0) {
      result = await client.query(
        `SELECT id, clue_word, mystery_word, category, connection
         FROM fuzzle_words
         WHERE id != ALL($1::int[])
         ORDER BY RANDOM()
         LIMIT $2`,
        [excludeIds, count]
      );
    } else {
      result = await client.query(
        `SELECT id, clue_word, mystery_word, category, connection
         FROM fuzzle_words
         ORDER BY RANDOM()
         LIMIT $1`,
        [count]
      );
    }

    return res.json(result.rows);
  } catch (err) {
    console.error('Words API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
