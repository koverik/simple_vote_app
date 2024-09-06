const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware a JSON kérés kezeléséhez
app.use(express.json());

// Szavazások betöltése a fájlból
const loadPolls = () => {
  const data = fs.readFileSync('polls.json');
  return JSON.parse(data);
};

// Szavazatok tárolása
const saveVotes = (votes) => {
  fs.writeFileSync('votes.json', JSON.stringify(votes, null, 2));
};

// Szavazatok betöltése a fájlból
const loadVotes = () => {
  if (!fs.existsSync('votes.json')) return {};
  const data = fs.readFileSync('votes.json');
  return JSON.parse(data);
};

// Szavazások és szavazatok betöltése
let polls = loadPolls();
let votes = loadVotes();

// Szavazás lista megjelenítése
app.get('/polls', (req, res) => {
  const now = new Date();
  const validPolls = polls.filter(poll => new Date(poll.expiresAt) > now);
  res.json(validPolls);
});

// Szavazat beküldése
app.post('/vote', (req, res) => {
  const { pollId, option } = req.body;

  if (!pollId || !option) {
    return res.status(400).json({ error: 'Poll ID and option are required.' });
  }

  // Ellenőrizzük, hogy létezik-e a szavazás és az opció
  const poll = polls.find(p => p.id === pollId);
  if (!poll || !poll.options.includes(option)) {
    return res.status(404).json({ error: 'Poll or option not found.' });
  }

  // Szavazatok tárolása anonim módon
  if (!votes[pollId]) votes[pollId] = {};
  votes[pollId][option] = (votes[pollId][option] || 0) + 1;
  saveVotes(votes);

  res.json({ message: 'Vote recorded successfully.' });
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
