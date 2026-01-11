// feld4.js — komplette, saubere Version für DEIN HTML

// === KONFIG ===
// Supabase Daten (die hast du bereits)
const SUPABASE_URL = "https://skkdkgirllqyxkyalzfb.supabase.co";
// anon key MUSS global gesetzt sein, z.B. in script.js:
// window.SUPABASE_ANON_KEY = "xxxxx";

let supabaseClient = null;
let saveTimer = null;

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("feld4.js geladen");

  const tile4 = document.getElementById("tile-4");
  if (!tile4) {
    console.error("tile-4 nicht gefunden");
    return;
  }

  tile4.addEventListener("click", () => {
    console.log("tile-4 klick");
    openNotes();
  });
});

// === SUPABASE ===
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase SDK nicht geladen");
    return null;
  }

  if (!window.SUPABASE_ANON_KEY) {
    console.error("SUPABASE_ANON_KEY fehlt (global setzen!)");
    return null;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  return supabaseClient;
}

// === OVERLAY LOGIK ===
function openNotes() {
  const overlay = document.getElementById("overlay");
  const title = document.getElementById("overlay-title");
  const content = document.getElementById("overlay-content");
  const closeBtn = document.getElementById("close");
  const setup = document.getElementById("setup");
  const game = document.getElementById("game");

  if (!overlay || !content || !title) {
    console.error("Overlay-Elemente fehlen");
    return;
  }

  // Overlay sichtbar machen (WICHTIG bei deinem HTML)
  overlay.style.display = "block";

  // Trinkspiel verstecken
  if (setup) setup.style.display = "none";
  if (game) game.style.display = "none";

  // Titel setzen
  title.textContent = "Notizen";

  // Content setzen
  content.innerHTML = `
    <div id="save-status" style="margin-bottom:10px;font-size:14px;opacity:.8;"></div>
    <div class="notes-container">
      ${createNoteInputs()}
    </div>
  `;

  // Close-Button (nicht mehrfach!)
  closeBtn.onclick = closeNotes;

  // Autosave
  document.querySelectorAll(".note-line").forEach((input) => {
    input.addEventListener("input", scheduleSave);
  });

  // Laden
  loadNotes();
}

function closeNotes() {
  const overlay = document.getElementById("overlay");
  const content = document.getElementById("overlay-content");
  const setup = document.getElementById("setup");

  overlay.style.display = "none";
  content.innerHTML = "";

  // Trinkspiel wieder zeigen (für Feld 1)
  if (setup) setup.style.display = "block";

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
}

// === NOTIZEN ===
function createNoteInputs() {
  let html = "";
  for (let i = 0; i < 10; i++) {
    html += `
      <input
        class="note-line"
        type="text"
        maxlength="30"
        placeholder="Notiz ${i + 1}"
        data-index="${i}"
        style="display:block;width:100%;margin-bottom:8px;padding:6px;"
      >
    `;
  }
  return html;
}

function collectNotes() {
  return Array.from(document.querySelectorAll(".note-line"))
    .map((i) => (i.value || "").slice(0, 30));
}

function fillNotes(notes) {
  const inputs = document.querySelectorAll(".note-line");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = (notes[i] || "").slice(0, 30);
  }
}

function setStatus(text) {
  const el = document.getElementById("save-status");
  if (el) el.textContent = text;
}

// === SUPABASE IO ===
async function loadNotes() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setStatus("Supabase nicht verfügbar");
    return;
  }

  setStatus("Lade…");

  const { data, error } = await supabase
    .from("field4_notes")
    .select("notes")
    .eq("id", 1)
    .single();

  if (error) {
    // Falls Zeile noch nicht existiert → anlegen
    const empty = Array(10).fill("");
    const up = await supabase
      .from("field4_notes")
      .upsert({ id: 1, notes: empty });

    if (up.error) {
      console.error("Supabase Fehler:", up.error);
      setStatus("Fehler beim Laden");
      return;
    }

    fillNotes(empty);
    setStatus("Bereit");
    return;
  }

  fillNotes(Array.isArray(data.notes) ? data.notes : []);
  setStatus("Bereit");
}

function scheduleSave() {
  setStatus("Änderungen…");
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNotes, 500);
}

async function saveNotes() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setStatus("Supabase nicht verfügbar");
    return;
  }

  const notes = collectNotes();
  setStatus("Speichere…");

  const { error } = await supabase
    .from("field4_notes")
    .upsert({ id: 1, notes });

  if (error) {
    console.error("Speichern fehlgeschlagen:", error);
    setStatus("Speichern fehlgeschlagen");
    return;
  }

  setStatus("Gespeichert");
}
