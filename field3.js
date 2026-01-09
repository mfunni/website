// ===============================
// Feld 3 – Foto Upload (Cloudinary)
// ===============================

// Cloudinary Daten
const CLOUD_NAME = "dddznkw3s";
const UPLOAD_PRESET = "mfunni";

// Wir speichern die letzte Bild-URL lokal, damit sie nach Reload noch da ist
const FIELD3_URL_KEY = "field3-cloudinary-url";

// Hinweis: overlayTitle/overlayText/overlayContent/openOverlay kommen aus script.js
function renderField3() {
  overlayTitle.textContent = "📷 Feld 3 – Foto Upload";
  overlayText.innerHTML = `
    <p><strong>So funktioniert’s:</strong><br>
    Bild auswählen → Upload → wird angezeigt.<br>
    Neues Bild ersetzt das alte.</p>
  `;

  // Trinkspiel-UI ausblenden (falls vorhanden)
  const setupEl = document.getElementById("setup");
  const gameEl = document.getElementById("game");
  if (setupEl) setupEl.style.display = "none";
  if (gameEl) gameEl.style.display = "none";

  overlayContent.innerHTML = `
    <div style="display:grid; gap:12px; max-width:650px;">
      <input id="field3-file" type="file" accept="image/*" />
      <button id="field3-upload">⬆️ Upload</button>

      <div id="field3-status" style="min-height:22px;"></div>

      <div id="field3-preview" style="
        width:100%;
        min-height:240px;
        border:2px dashed #888;
        border-radius:10px;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        background:#f7f7f7;
      ">
        <span style="color:#666;">Noch kein Bild</span>
      </div>
    </div>
  `;

  // Letzte URL anzeigen, falls vorhanden
  const savedUrl = localStorage.getItem(FIELD3_URL_KEY);
  if (savedUrl) showField3Image(savedUrl);

  const fileInput = document.getElementById("field3-file");
  const uploadBtn = document.getElementById("field3-upload");
  const statusEl = document.getElementById("field3-status");

  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      statusEl.textContent = "Bitte zuerst ein Bild auswählen.";
      return;
    }

    if (!file.type.startsWith("image/")) {
      statusEl.textContent = "Bitte eine Bilddatei auswählen.";
      return;
    }

    statusEl.textContent = "Upload läuft ...";

    try {
      const url = await uploadToCloudinary(file);
      localStorage.setItem(FIELD3_URL_KEY, url); // überschreibt alte URL
      showField3Image(url);
      statusEl.textContent = "✅ Upload fertig!";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "❌ Upload fehlgeschlagen (Konsole prüfen).";
    }
  });
}

async function uploadToCloudinary(file) {
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(endpoint, { method: "POST", body: formData });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary Error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.secure_url;
}

function showField3Image(url) {
  const preview = document.getElementById("field3-preview");
  if (!preview) return;

  preview.innerHTML = `
    <img src="${url}" alt="Upload"
      style="width:100%; height:100%; object-fit:contain; display:block;">
  `;
}

// Klick auf Feld 3
document.addEventListener("DOMContentLoaded", () => {
  const tile3 = document.getElementById("tile-3");
  if (!tile3) return;

  tile3.addEventListener("click", () => {
    renderField3();
    openOverlay();
  });
});

