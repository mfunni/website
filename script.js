document.getElementById("tile-1").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Trinkspiel";
  document.getElementById("overlay").style.display = "block";
});
document.getElementById("close").addEventListener("click", function () {
  document.getElementById("overlay").style.display = "none";
});
document.getElementById("tile-8").addEventListener("click", function () {
  document.getElementById("overlay-title").textContent = "Ragna ist cool!";
  document.getElementById("overlay").style.display = "block";
});
