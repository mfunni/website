// ===============================
// Feld 4 – Notizen (Supabase REST)
// 10 Zeilen, max 30 Zeichen, global gespeichert (id=1)
// ===============================

// ---------- Supabase ----------
const SUPABASE_URL = "https://skkdkgirllqyxkyalzfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2RrZ2lybGxxeXhreWFsemZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5ODA2MTQsImV4cCI6MjA4MzU1NjYxNH0.mXx1ZcsZZtIsLP4A-FYu-5U9ZtJztQv7j1l2bpJCc7E";

// Tabelle/Row für Feld 4
const NOTES_TABLE = "field4_notes";
const NOTES_ID = 1;

let saveTimer = null;

// Erwartet, dass script.js diese globalen Dinge bereitstellt:
// overlayTitle, overlayContent, openOverlay

async function renderField4() {
  overlayTitle.textContent = "Notizen";

  // Trinkspiel-UI ausblenden (falls im Overlay vorhanden)
  const setupEl = document.getElementById("setup");
  const gameEl = document.getElementById("game");
  if (setupEl) setupEl.style.display = "none";
  if (gameEl) gameEl.style.display = "none";

  overlayContent.innerHTML = `
    <div style="display:grid; gap:10px; max-width:720px;">
      <div id="field4-status" style="min-height:22px; opacity:.8;"></div>
      <div id="field4-notes" style="display:grid; gap:8px;"></div>
    </div>
  `;

  // Inputs bauen
  const notesWrap = document.getElementById("field4-notes");
  notesWrap.innerHTML = createNoteInputsHtml();

  // Laden
  await loadNotesIntoInputs();

  // Autosave bei Input (debounced)
  const inputs = notesWrap.querySelectorAll(".field4-note");
  inputs.forEach((inp) => {
    inp.addEventListener("input", () => {
      setField4Status("Änderungen…");
      scheduleSave();
    });
  });
}

function createNoteInputsHtml() {
  let html = "";
  for (let i = 0; i < 10; i++) {
    html += `
      <input
        class="field4-note"
        type="text"
        maxlength="30"
        placeholder="Notiz ${i + 1}"
        data-index="${i}"
        style="padding:8px; font-size:16px;"
      />
    `;
  }
  return html;
}

function setField4Status(text) {
  const el = document.getElementById("field4-status");
  if (el) el.textContent = text;
}

function getNotesFromInputs() {
  const inputs = document.querySelectorAll(".field4-note");
  return Array.from(inputs).map((inp) => (inp.value || "").toString().slice(0, 30));
}

function fillInputsFromNotes(notesArr) {
  const inputs = document.querySelectorAll(".field4-note");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = ((notesArr && notesArr[i]) ? String(notesArr[i]) : "").slice(0, 30);
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await supabaseUpsertNotes(getNotesFromInputs());
      setField4Status("Gespeichert ✅");
    } catch (e) {
      console.error(e);
      setField4Status("Speichern fehlgeschlagen ❌ (Konsole prüfen)");
    }
  }, 500);
}

// ---------- Supabase REST Helpers ----------

// SELECT notes aus: field4_notes where id = 1
async function supabaseSelectNotes() {
  const url = `${SUPABASE_URL}/rest/v1/${NOTES_TABLE}?id=eq.${NOTES_ID}&select=notes`;

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
  const notes = rows?.[0]?.notes;
  return Array.isArray(notes) ? notes : null;
}

// UPSERT notes auf id=1 (POST + Prefer merge-duplicates)
async function supabaseUpsertNotes(notesArr) {
  const url = `${SUPABASE_URL}/rest/v1/${NOTES_TABLE}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: NOTES_ID,
      notes: notesArr,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase UPSERT Error ${res.status}: ${text}`);
  }
}

async function loadNotesIntoInputs() {
  setField4Status("Lade…");

  try {
    const notes = await supabaseSelectNotes();

    if (notes) {
      fillInputsFromNotes(notes);
      setField4Status("Bereit");
      return;
    }

    // Falls noch keine Row existiert: anlegen
    const empty = Array(10).fill("");
    await supabaseUpsertNotes(empty);
    fillInputsFromNotes(empty);
    setField4Status("Bereit");
  } catch (e) {
    console.error(e);
    setField4Status("Fehler beim Laden ❌ (Konsole prüfen)");
  }
}

// ---------- Feld 4 Klick ----------
document.addEventListener("DOMContentLoaded", () => {
  const tile4 = document.getElementById("tile-4");
  if (!tile4) return;

  tile4.addEventListener("click", async () => {
    await renderField4();
    openOverlay();
  });
});
