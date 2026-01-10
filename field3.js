// ===============================
// Feld 3 – Globales Bild (Cloudinary + Supabase "latest")
// Jeder sieht immer das zuletzt hochgeladene Bild
// ===============================

// ---------- Cloudinary ----------
const CLOUD_NAME = "dddznkw3s";
const UPLOAD_PRESET = "mfunni";

// ---------- Supabase ----------
const SUPABASE_URL = "https://skkdkgirllqyxkyalzfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2RrZ2lybGxxeXhreWFsemZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5ODA2MTQsImV4cCI6MjA4MzU1NjYxNH0.mXx1ZcsZZtIsLP4A-FYu-5U9ZtJztQv7j1l2bpJCc7E";

// Tabelle/Row, in der wir die "latest url" speichern
const LATEST_TABLE = "latest_image";
const LATEST_ID = 1;

// Erwartet, dass script.js diese globalen Dinge bereitstellt:
// overlayTitle, overlayText, overlayContent, openOverlay

async function renderField3() {
  // Grund-UI
  overlayTitle.textContent = "<p>📷 Das letzte Bild gewinnt";
  // overlayText.innerHTML = `<p>📷 Jeder sieht hier immer das <strong>zuletzt hochgeladene</strong> Bild.<br></p>`;

  // Trinkspiel-UI ausblenden (falls im Overlay vorhanden)
  const setupEl = document.getElementById("setup");
  const gameEl = document.getElementById("game");
  if (setupEl) setupEl.style.display = "none";
  if (gameEl) gameEl.style.display = "none";

  overlayContent.innerHTML = `
    <div style="display:grid; gap:12px; max-width:720px;">
      <input id="field3-file" type="file" accept="image/*" />
      <button id="field3-upload">⬆️ Upload (setzt global)</button>

      <div id="field3-status" style="min-height:22px;"></div>

      <div id="field3-preview" style="
        width:100%;
        min-height:280px;
        border:2px dashed #888;
        border-radius:10px;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        background:#f7f7f7;
      ">
        <span style="color:#666;">Lade aktuelles Bild ...</span>
      </div>
    </div>
  `;

  // Beim Öffnen: globales "latest" laden
  await loadLatestIntoPreview();

  // Upload-Handler
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
      statusEl.textContent = "Bitte eine Bilddatei wählen.";
      return;
    }

    statusEl.textContent = "Upload läuft ...";

    try {
      // 1) Upload zu Cloudinary -> URL
      const url = await uploadToCloudinary(file);

      // 2) URL in Supabase als globales Latest speichern
      await supabaseSetLatestUrl(url);

      // 3) Anzeigen
      showField3Image(url);
      statusEl.textContent = "✅ Globales Bild aktualisiert!";
      fileInput.value = "";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "❌ Upload fehlgeschlagen (Konsole prüfen).";
    }
  });
}

async function loadLatestIntoPreview() {
  const preview = document.getElementById("field3-preview");
  try {
    const latestUrl = await supabaseGetLatestUrl();
    if (latestUrl) {
      showField3Image(latestUrl);
    } else {
      preview.innerHTML = `<span style="color:#666;">Noch kein globales Bild gesetzt</span>`;
    }
  } catch (e) {
    console.error(e);
    preview.innerHTML = `<span style="color:#c00;">Fehler beim Laden (Konsole prüfen)</span>`;
  }
}

// ---------- Cloudinary Upload ----------
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
  if (!data.secure_url) throw new Error("Cloudinary: secure_url fehlt im Response.");
  return data.secure_url;
}

// ---------- Preview ----------
function showField3Image(url) {
  const preview = document.getElementById("field3-preview");
  if (!preview) return;

  preview.innerHTML = `
    <img src="${url}" alt="Global Upload"
      style="width:100%; height:100%; object-fit:contain; display:block;">
  `;
}

// ---------- Supabase REST Helpers ----------
// Holt url aus: latest_image where id = 1
async function supabaseGetLatestUrl() {
  const url = `${SUPABASE_URL}/rest/v1/${LATEST_TABLE}?id=eq.${LATEST_ID}&select=url`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase SELECT Error ${res.status}: ${text}`);
  }

  const rows = await res.json();
  const latest = rows?.[0]?.url ?? "";
  return latest.trim() || null;
}

// Upsert auf id=1 (POST + Prefer merge-duplicates)
async function supabaseSetLatestUrl(latestUrl) {
  const url = `${SUPABASE_URL}/rest/v1/${LATEST_TABLE}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: LATEST_ID,
      url: latestUrl,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase UPSERT Error ${res.status}: ${text}`);
  }
}

// ---------- Feld 3 Klick ----------
document.addEventListener("DOMContentLoaded", () => {
  const tile3 = document.getElementById("tile-3");
  if (!tile3) return;

  tile3.addEventListener("click", async () => {
    await renderField3();
    openOverlay();
  });
});
