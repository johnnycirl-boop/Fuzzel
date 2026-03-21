const express = require('express');
const path = require('path');
const leaderboard = require('./api/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.all('/api/leaderboard', (req, res) => leaderboard(req, res));

app.listen(PORT, () => {
  console.log(`Fuzzel server running at http://localhost:${PORT}`);
});
