const historyBody = document.getElementById("historyBody");
const inputElement = document.getElementById("guessInput");
const suggestionBox = document.createElement("div");
suggestionBox.id = "suggestions";

inputElement.parentNode.style.position = "relative";
inputElement.parentNode.appendChild(suggestionBox);

let championNames = [];
let guessedChampions = []; 
let totalAttempts = 0;
let hasWon = false;

fetch('http://localhost:3000/champions')
  .then(res => res.json())
  .then(data => championNames = data)
  .catch(err => console.error("Błąd pobierania championów:", err));

inputElement.addEventListener("input", () => {
  const query = inputElement.value.toLowerCase();
  suggestionBox.innerHTML = "";

  if (!query) return;

  // Filtrowanie zgadniętych
  const matches = championNames
    .filter(name => 
      name.toLowerCase().includes(query) &&
      !guessedChampions.includes(name)
    )
    .slice(0, 5);

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = match;
    div.onclick = () => {
      inputElement.value = match;
      suggestionBox.innerHTML = "";
      inputElement.focus();
    };
    suggestionBox.appendChild(div);
  });
});

inputElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    submitGuess();
    suggestionBox.innerHTML = "";
  }
});

async function submitGuess() {
  const guess = inputElement.value.trim();
  if (!guess) return;

  const response = await fetch('http://localhost:3000/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: guess })
  });

  if (!response.ok) {
    alert("Nie znaleziono championa!");
    return;
  }

  const data = await response.json();

  // Historia
  const row = document.createElement("tr");
function arrowIcon(direction) {
  if (direction === "up") return '🔼';
  if (direction === "down") return '🔽';
  return '';
}

row.innerHTML = `
  <td class="${data.name ? 'correct' : 'incorrect'}">${data.guessedName}</td>
  <td class="${data.race ? 'correct' : 'incorrect'}">${data.guessedRace}</td>
  <td class="${data.type ? 'correct' : 'incorrect'}">${data.guessedType}</td>
  <td class="${data.faction ? 'correct' : 'incorrect'}">${data.guessedFaction}</td>
  <td class="${data.cost ? 'correct' : 'incorrect'}">
    ${data.guessedCost}
    ${data.costHint ? `<span style="color:#ffa500; margin-left:5px;">${arrowIcon(data.costHint)}</span>` : ''}
  </td>
  <td class="${data.cp ? 'correct' : 'incorrect'}">
    ${data.guessedCp}
    ${data.cpHint ? `<span style="color:#ffa500; margin-left:5px;">${arrowIcon(data.cpHint)}</span>` : ''}
  </td>
`;


  historyBody.appendChild(row);

  // Zgadnięci
  guessedChampions.push(data.guessedName);

  

  inputElement.value = "";

totalAttempts++;

const attemptsElem = document.getElementById("attempts");
const statusElem = document.getElementById("status");

attemptsElem.textContent = totalAttempts;

const allCorrect = data.name && data.race && data.type && data.faction && data.cost && data.cp;
if (allCorrect) {
  hasWon = true;
  statusElem.textContent = `🎉 Brawo! Zgadłeś po ${totalAttempts} próbach.`;
  showFireworks();

    // Zablokuj input i przycisk po zwycięstwie
  inputElement.disabled = true;
  const guessButton = document.querySelector('button[onclick="submitGuess()"]');
  if (guessButton) guessButton.disabled = true;

  // Możesz też zmienić placeholder inputu, żeby było bardziej czytelnie
  inputElement.placeholder = "✅ Zgadłeś poprawnie!";
} else {
  statusElem.textContent = `Jeszcze nie zgadłeś!`;
}

}
function showFireworks() {
  const container = document.getElementById('fireworks-container');
  container.style.display = 'block';

  const colors = ['#FFD700', '#FF4500', '#1E90FF', '#32CD32', '#FF69B4'];
  const particlesCount = 30;

  for (let i = 0; i < particlesCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firework-particle');
    particle.style.background = colors[i % colors.length];

    // Startowa pozycja cząstki - losowo na całym ekranie
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    // Losowy kierunek i dystans - teraz na całym ekranie (np. do ±150px)
    const angle = Math.random() * 2 * Math.PI;
    const distance = 100 + Math.random() * 100;

    // Ustaw zmienne CSS --dx i --dy, żeby animacja mogła z nich korzystać
    const dx = Math.cos(angle) * distance + 'px';
    const dy = Math.sin(angle) * distance + 'px';
    particle.style.setProperty('--dx', dx);
    particle.style.setProperty('--dy', dy);

    container.appendChild(particle);

    // Po 50ms * i uruchamiamy animację (żeby cząstki startowały lekko falowo)
    setTimeout(() => {
      particle.style.animationPlayState = 'running';
    }, 50 * i);

    // Usuwamy element po zakończeniu animacji
    particle.addEventListener('animationend', () => {
      particle.remove();
      if (container.children.length === 0) {
        container.style.display = 'none';
      }
    });
  }
}


// ./backend/ ----  node app.js <--start