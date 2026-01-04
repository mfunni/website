// -------------------------
// Spiel-Zustand
// -------------------------
let playerCount = 0;
let currentIndex = 0;

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
// Helfer: Shuffle + Optionen bauen (richtige Antwort nicht immer gleich)
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
// UI: Frage rendern (in #game)
// Voraussetzung: In deinem HTML gibt es #game (div) und #status (p)
// -------------------------
function renderQuestion() {
  const q = questions[currentIndex];
  const options = buildOptions(q);

  const game = document.getElementById("game");
  const status = document.getElementById("status");

  status.textContent = `Frage ${currentIndex + 1}/${questions.length}: Hauptstadt von ${q.country}?`;

  // Wir bauen die Antwortbuttons dynamisch in #game
  // (dein #next-question Button bleibt unten weiterhin vorhanden)
  const answersHtml = options
    .map((opt, idx) => {
      const letter = ["A", "B", "C", "D"][idx];
      return `<button class="answer-btn" data-answer="${opt}" style="display:block; width:100%; margin:10px 0; padding:12px; font-size:16px;">
        ${letter}: ${opt}
      </button>`;
    })
    .join("");

  // Wir behalten den Next-Button am Ende (falls er bei dir schon existiert)
  const nextBtn = document.getElementById("next-question");

  // Inhalt setzen: Antworten oben, Next-Button darunter
  game.innerHTML = `
    <div id="answers">
      ${answersHtml}
    </div>
  `;

  // Next-Button wieder anhängen (falls vorhanden)
  if (nextBtn) game.appendChild(nextBtn);

  // Klick-Listener für Antworten (nur Anzeige richtig/falsch — Trinken kommt später)
  document.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const picked = this.getAttribute("data-answer");
      if (picked === q.correct) {
        status.textContent = `✅ Richtig! ${q.correct} ist die Hauptstadt von ${q.country}.`;
      } else {
        status.textContent = `❌ Falsch! Richtig ist: ${q.correct}.`;
      }
    });
  });
}

// -------------------------
// Overlay öffnen/schließen + Inhalte für Feld 1 und Feld 8
// -------------------------
document.getElementById("tile-1").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Trinkspiel";
  document.getElementById("overlay-text").textContent = "Bitte Spieleranzahl eingeben:";
  document.getElementById("overlay").style.display = "block";
});

document.getElementById("tile-8").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Ragna ist cool!";
  document.getElementById("overlay-text").textContent = "";
  document.getElementById("overlay").style.display = "block";
});

document.getElementById("close").addEventListener("click", function () {
  document.getElementById("overlay").style.display = "none";
});

// -------------------------
// Start-Button: Spieleranzahl speichern + Setup ausblenden + Game einblenden
// Voraussetzung: HTML hat #setup, #game, #player-count, #start-game, #game-message, #status
// -------------------------
document.getElementById("start-game").addEventListener("click", function () {
  const count = Number(document.getElementById("player-count").value);
  const message = document.getElementById("game-message");

  if (count >= 1 && count <= 9) {
    playerCount = count;
    currentIndex = 0;

    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "block";

    document.getElementById("status").textContent =
      "Spiel läuft mit " + playerCount + " Spielern.";

    // Direkt erste Frage anzeigen
    renderQuestion();
  } else {
    message.textContent = "Bitte eine Zahl zwischen 1 und 9 eingeben.";
  }
});

// -------------------------
// Nächste Frage: Index erhöhen und neue Frage anzeigen
// Voraussetzung: HTML hat Button #next-question
// -------------------------
document.getElementById("next-question").addEventListener("click", function () {
  currentIndex++;

  if (currentIndex >= questions.length) {
    document.getElementById("status").textContent = "✅ Ende! Alle Fragen durch.";
    return;
  }

  renderQuestion();
});
