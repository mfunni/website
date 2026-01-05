// -------------------------
// Spiel-Zustand
// -------------------------
let playerCount = 0;
let currentIndex = 0;
let currentQuestion = null;

// -------------------------
// Fragenpool Europa (Hauptstädte)
// -------------------------
const questions = [
  { country: "Albanien", correct: "Tirana", wrong: ["Skopje", "Sofia", "Podgorica"] },
  { country: "Andorra", correct: "Andorra la Vella", wrong: ["Vaduz", "Monaco", "San Marino"] },
  { country: "Belgien", correct: "Brüssel", wrong: ["Amsterdam", "Luxemburg", "Paris"] },
  { country: "Bosnien und Herzegowina", correct: "Sarajevo", wrong: ["Belgrad", "Zagreb", "Podgorica"] },
  { country: "Bulgarien", correct: "Sofia", wrong: ["Bukarest", "Skopje", "Athen"] },
  { country: "Dänemark", correct: "Kopenhagen", wrong: ["Oslo", "Stockholm", "Helsinki"] },
  { country: "Deutschland", correct: "Berlin", wrong: ["Bern", "Warschau", "Paris"] },
  { country: "Estland", correct: "Tallinn", wrong: ["Riga", "Vilnius", "Helsinki"] },
  { country: "Finnland", correct: "Helsinki", wrong: ["Stockholm", "Oslo", "Tallinn"] },
  { country: "Frankreich", correct: "Paris", wrong: ["Madrid", "Brüssel", "Rom"] },
  { country: "Griechenland", correct: "Athen", wrong: ["Sofia", "Bukarest", "Ankara"] },
  { country: "Irland", correct: "Dublin", wrong: ["Belfast", "Edinburgh", "Cardiff"] },
  { country: "Island", correct: "Reykjavík", wrong: ["Oslo", "Helsinki", "Tórshavn"] },
  { country: "Italien", correct: "Rom", wrong: ["Mailand", "Neapel", "Florenz"] },
  { country: "Kosovo", correct: "Pristina", wrong: ["Skopje", "Tirana", "Podgorica"] },
  { country: "Kroatien", correct: "Zagreb", wrong: ["Ljubljana", "Belgrad", "Sarajevo"] },
  { country: "Lettland", correct: "Riga", wrong: ["Tallinn", "Vilnius", "Helsinki"] },
  { country: "Liechtenstein", correct: "Vaduz", wrong: ["Bern", "Luxemburg", "Monaco"] },
  { country: "Litauen", correct: "Vilnius", wrong: ["Riga", "Tallinn", "Warschau"] },
  { country: "Luxemburg", correct: "Luxemburg", wrong: ["Brüssel", "Straßburg", "Bern"] },
  { country: "Malta", correct: "Valletta", wrong: ["Nikosia", "Palermo", "Athen"] },
  { country: "Moldau", correct: "Chișinău", wrong: ["Bukarest", "Kiew", "Sofia"] },
  { country: "Monaco", correct: "Monaco", wrong: ["Nizza", "Marseille", "San Marino"] },
  { country: "Montenegro", correct: "Podgorica", wrong: ["Sarajevo", "Skopje", "Tirana"] },
  { country: "Niederlande", correct: "Amsterdam", wrong: ["Brüssel", "Berlin", "Kopenhagen"] },
  { country: "Nordmazedonien", correct: "Skopje", wrong: ["Sofia", "Tirana", "Pristina"] },
  { country: "Norwegen", correct: "Oslo", wrong: ["Stockholm", "Helsinki", "Kopenhagen"] },
  { country: "Österreich", correct: "Wien", wrong: ["Prag", "Budapest", "Bratislava"] },
  { country: "Polen", correct: "Warschau", wrong: ["Prag", "Berlin", "Budapest"] },
  { country: "Portugal", correct: "Lissabon", wrong: ["Madrid", "Porto", "Sevilla"] },
  { country: "Rumänien", correct: "Bukarest", wrong: ["Sofia", "Belgrad", "Chișinău"] },
  { country: "San Marino", correct: "San Marino", wrong: ["Monaco", "Vaduz", "Rom"] },
  { country: "Schweden", correct: "Stockholm", wrong: ["Oslo", "Helsinki", "Kopenhagen"] },
  { country: "Schweiz", correct: "Bern", wrong: ["Zürich", "Genf", "Wien"] },
  { country: "Serbien", correct: "Belgrad", wrong: ["Sarajevo", "Zagreb", "Skopje"] },
  { country: "Slowakei", correct: "Bratislava", wrong: ["Prag", "Wien", "Budapest"] },
  { country: "Slowenien", correct: "Ljubljana", wrong: ["Zagreb", "Wien", "Triest"] },
  { country: "Spanien", correct: "Madrid", wrong: ["Barcelona", "Lissabon", "Rom"] },
  { country: "Tschechien", correct: "Prag", wrong: ["Wien", "Bratislava", "Berlin"] },
  { country: "Ukraine", correct: "Kiew", wrong: ["Minsk", "Chișinău", "Warschau"] },
  { country: "Ungarn", correct: "Budapest", wrong: ["Wien", "Bratislava", "Belgrad"] },
  { country: "Vereinigtes Königreich", correct: "London", wrong: ["Dublin", "Edinburgh", "Cardiff"] },
  { country: "Zypern", correct: "Nikosia", wrong: ["Athen", "Valletta", "Ankara"] },
];

// -------------------------
// Helfer: Shuffle + Optionen bauen
// -------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildOptions(q) {
  return shuffle([q.correct, ...q.wrong]);
}

// -------------------------
// UI: Frage rendern
// Voraussetzungen im HTML:
// #question-text, #answers, #status
// -------------------------
function renderQuestion() {
  currentQuestion = questions[currentIndex];
  const options = buildOptions(currentQuestion);

  document.getElementById("question-text").textContent =
    `Frage ${currentIndex + 1}/${questions.length}: Was ist die Hauptstadt von ${currentQuestion.country}?`;

  document.getElementById("status").textContent = "Wähle A–D:";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = options
    .map((opt, idx) => {
      const letter = ["A", "B", "C", "D"][idx];
      return `
        <button class="answer-btn" data-answer="${opt}"
          style="display:block; width:100%; margin:10px 0; padding:12px; font-size:16px;">
          ${letter}: ${opt}
        </button>
      `;
    })
    .join("");
}

// -------------------------
// Antworten-Klick (Event Delegation)
// -------------------------
document.getElementById("answers").addEventListener("click", function (e) {
  const btn = e.target.closest(".answer-btn");
  if (!btn || !currentQuestion) return;

  const picked = btn.getAttribute("data-answer");

  if (picked === currentQuestion.correct) {
  const randomPlayer = Math.floor(Math.random() * playerCount) + 1;

  document.getElementById("status").textContent =
    `✅ Richtig! Spieler ${randomPlayer} trinkt 🍺`;
} else {
  document.getElementById("status").textContent =
    `❌ Falsch! Du trinkst 🍻 (Richtig wäre: ${currentQuestion.correct})`;
}

});

// -------------------------
// Overlay öffnen/schließen + Inhalte für Feld 1 und Feld 8
// Voraussetzungen im HTML:
// #overlay, #overlay-title, #overlay-text, #setup, #game, #game-message,
// #player-count, #question-text, #answers, #status
// -------------------------
document.getElementById("tile-1").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Trinkspiel";
  document.getElementById("overlay-text").textContent = "";

  // Reset auf Setup-Ansicht
  document.getElementById("setup").style.display = "block";
  document.getElementById("game").style.display = "none";
  document.getElementById("game-message").textContent = "";
  document.getElementById("player-count").value = "";
  document.getElementById("question-text").textContent = "";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("status").textContent = "";

  document.getElementById("overlay").style.display = "block";
});

document.getElementById("tile-8").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Ragna ist cool!";
  document.getElementById("overlay-text").textContent = "";

  // Setup/Game ausblenden
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("game-message").textContent = "";
  document.getElementById("question-text").textContent = "";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("status").textContent = "";

  document.getElementById("overlay").style.display = "block";
});

document.getElementById("close").addEventListener("click", function () {
  document.getElementById("overlay").style.display = "none";
});

// -------------------------
// Start: Spieleranzahl speichern + Spiel anzeigen + erste Frage
// -------------------------
document.getElementById("start-game").addEventListener("click", function () {
  const count = Number(document.getElementById("player-count").value);
  const message = document.getElementById("game-message");

  if (count >= 1 && count <= 9) {
    playerCount = count;
    currentIndex = 0;

    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "block";

    renderQuestion();
  } else {
    message.textContent = "Bitte eine Zahl zwischen 1 und 9 eingeben.";
  }
});

// -------------------------
// Nächste Frage
// -------------------------
document.getElementById("next-question").addEventListener("click", function () {
  currentIndex++;

  if (currentIndex >= questions.length) {
    document.getElementById("status").textContent = "✅ Ende! Alle Fragen durch.";
    return;
  }

  renderQuestion();
});

// ===============================
// Overlay-Referenzen
// ===============================
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayContent = document.getElementById("overlay-content");

// ===============================
// Overlay öffnen / schließen
// ===============================
function openOverlay() {
  overlay.style.display = "block";
}

function closeOverlay() {
  overlay.style.display = "none";
  overlayText.textContent = "";
  overlayContent.innerHTML = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeOverlay();
});


// ===============================
// Overlay-Referenzen
// ===============================
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayContent = document.getElementById("overlay-content");

// ===============================
// Feld 2 – Glücksspiel (robust, ohne ID-Kollisionen)
// ===============================
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayContent = document.getElementById("overlay-content");

function openOverlay() {
  overlay.style.display = "block";
}

function closeOverlay() {
  overlay.style.display = "none";
  overlayText.textContent = "";
  overlayContent.innerHTML = "";
}

let coins = 10;
let gameOver = false;

function renderField2() {
  overlayTitle.textContent = "🎲 Glücksspiel";
  overlayText.textContent = `💰 Münzen: ${coins}`;

  overlayContent.innerHTML = `
    <div style="margin-top:16px; display:grid; gap:14px;">

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button id="field2-bet-black">⚫ Schwarz</button>
        <button id="field2-bet-white">⚪ Weiß</button>
      </div>

      <div id="field2-result" style="min-height:24px;">Wähle einen Einsatz.</div>

      <div>
        <div style="margin-bottom:8px;">🔢 Zahl 1–10</div>
        <div id="field2-num-grid" style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px;">
          ${Array.from({ length: 10 }, (_, i) =>
            `<button class="field2-num-btn" data-num="${i + 1}">${i + 1}</button>`
          ).join("")}
        </div>
      </div>

      <button id="field2-restart">🔄 Neustart</button>
      <button id="field2-close">❌ Schließen</button>
    </div>
  `;

  document.getElementById("field2-bet-black").addEventListener("click", betColor);
  document.getElementById("field2-bet-white").addEventListener("click", betColor);

  document.getElementById("field2-num-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".field2-num-btn");
    if (!btn) return;
    betNumber(Number(btn.dataset.num));
  });

  document.getElementById("field2-restart").addEventListener("click", resetGame);
  document.getElementById("field2-close").addEventListener("click", closeOverlay);
}

function betColor() {
  if (gameOver || coins < 1) return;

  coins += Math.random() < 0.5 ? 1 : -1;
  document.getElementById("field2-result").textContent = "Farbe gespielt.";
  updateGame();
}

function betNumber(chosen) {
  if (gameOver || coins < 1) return;

  const drawn = Math.floor(Math.random() * 10) + 1;

  if (chosen === drawn) {
    coins += 10;
    document.getElementById("field2-result").textContent =
      `🎉 Treffer! Die ${drawn} war richtig (+10)`;
  } else {
    coins -= 1;
    document.getElementById("field2-result").textContent =
      `❌ Daneben. Gezogene Zahl: ${drawn} (−1)`;
  }

  updateGame();
}

function updateGame() {
  overlayText.textContent = `💰 Münzen: ${coins}`;

  if (coins >= 50) {
    gameOver = true;
    document.getElementById("field2-result").textContent =
      "🎉 Glückwunsch! Du hast 50 Münzen erreicht!";
  } else if (coins <= 0) {
    gameOver = true;
    document.getElementById("field2-result").textContent =
      "💀 Keine Münzen mehr – Spiel vorbei.";
  }
}

function resetGame() {
  coins = 10;
  gameOver = false;
  renderField2();
}

// Listener sicher setzen (auch wenn später umgebaut wird)
document.addEventListener("DOMContentLoaded", () => {
  const tile2 = document.getElementById("tile-2");
  if (!tile2) return;

  tile2.addEventListener("click", () => {
    resetGame();
    openOverlay();
  });
});
