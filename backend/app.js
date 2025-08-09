const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));


app.use(express.static(path.join(__dirname, '../frontend')));

const champions = JSON.parse(fs.readFileSync('./champions.json'));

// Funkcja do deterministycznego wyboru championa na podstawie daty
function getChampionOfTheDay(dateStr) {
  // Zamiana daty na liczbę (np. suma kodów znaków)
  const seed = [...dateStr].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = seed % champions.length;
  // Wybierz index na podstawie seeda
  const selectedChampion = champions[index];

  console.log(`[${dateStr}] Wylosowany champion dnia: ${selectedChampion.name} (index: ${index})`);
    return selectedChampion;
}

app.get('/champion-of-the-day', (req, res) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0,10); // "YYYY-MM-DD"
  const championOfTheDay = getChampionOfTheDay(dateStr);

  // Wysyłamy np. tylko nazwę i inne dane (nie wszystko)
  res.json({
    name: championOfTheDay.name,
    race: championOfTheDay.race,
    type: championOfTheDay.type,
    faction: championOfTheDay.faction,
    cost: championOfTheDay.cost,
    cp: championOfTheDay.cp
  });
});

app.post('/guess', (req, res) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0,10);
  const championOfTheDay = getChampionOfTheDay(dateStr);

  const guessName = req.body.name.toLowerCase();
  const guessedChampion = champions.find(champ => champ.name.toLowerCase() === guessName);

  if (!guessedChampion) {
    return res.status(404).json({ error: 'Champion not found' });
  }

const comparison = {
  guessedName: guessedChampion.name,
  name: guessedChampion.name === championOfTheDay.name,
  guessedRace: guessedChampion.race,
  race: guessedChampion.race === championOfTheDay.race,
  guessedType: guessedChampion.type,
  type: guessedChampion.type === championOfTheDay.type,
  guessedFaction: guessedChampion.faction,
  faction: guessedChampion.faction === championOfTheDay.faction,
  guessedCost: guessedChampion.cost,
  cost: guessedChampion.cost === championOfTheDay.cost,
  guessedCp: guessedChampion.cp,
  cp: guessedChampion.cp === championOfTheDay.cp,
  costHint: null,
  cpHint: null
};

  //Podpowiedź czy więcej czy mniej
if (championOfTheDay.cost > guessedChampion.cost) {
  comparison.costHint = "up";
} else if (championOfTheDay.cost < guessedChampion.cost) {
  comparison.costHint = "down";
} else {
  comparison.costHint = "equal";
}

if (championOfTheDay.cp > guessedChampion.cp) {
  comparison.cpHint = "up";
} else if (championOfTheDay.cp < guessedChampion.cp) {
  comparison.cpHint = "down";
} else {
  comparison.cpHint = "equal";
}
  res.json(comparison);
});

app.get('/champions', (req, res) => {
  const names = champions.map(champ => champ.name);
  res.json(names);
});

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

