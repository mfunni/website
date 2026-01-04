document.getElementById("tile-1").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Trinkspiel";
  document.getElementById("overlay-text").textContent =
    "";
  document.getElementById("overlay").style.display = "block";
});
document.getElementById("close").addEventListener("click", function () {
  document.getElementById("overlay").style.display = "none";
});
document.getElementById("tile-8").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Ragna ist cool!";
  document.getElementById("overlay-text").textContent = "";
  document.getElementById("overlay").style.display = "block";
});
document.getElementById("start-game").addEventListener("click", function () {
  const count = Number(document.getElementById("player-count").value);
const message = document.getElementById("game-message");

if (count >= 1 && count <= 9) {
  playerCount = count;

  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("status").textContent =
    "Spiel läuft mit " + playerCount + " Spielern.";
} else {
  message.textContent = "Bitte eine Zahl zwischen 1 und 9 eingeben.";
}
});

