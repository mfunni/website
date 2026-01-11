// feld4.js

// Supabase Daten (aus deinem Memory)
const SUPABASE_URL = "https://skkdkgirllqyxkyalzfb.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || ""; // besser: anon key global setzen (siehe Hinweis unten)

function getSupabaseClient() {
  if (window.supabaseClient) return window.supabaseClient;

  // supabase-js v2 via CDN: window.supabase.createClient(...)
  if (window.supabase && window.supabase.createClient) {
    if (!SUPABASE_ANON_KEY) {
      console.error("SUPABASE_ANON_KEY fehlt. Setze ihn global in script.js oder in einer config.");
      return null;
    }
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window.supabaseClient;
  }

  console.error("Supabase SDK nicht gefunden. Stelle sicher, dass supabase-js eingebunden ist.");
  return null;
}

let saveTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  const tile4 = document.getElementById("tile-4");
  if (!tile4) {
    console.log("tile-4 nicht gefunden");
    return;
  }

  tile4.addEventListener("click", () => {
    openNotes();
  });
});

function openNotes() {
  const overlay = document.getElementById("overlay");
  const titleEl = document.getElementById("overlay-title");
  const contentEl = document.getElementById("overlay-content");
  const closeBtn = document.getElementById("close");
  const setup = document.getElementById("setup");
  const game = document.getElementById("game");

  // Overlay sichtbar machen (weil bei dir inline display:none steht!)
  overlay.style.display = "block";

  // Trinkspiel-Bereiche verstecken
  if (setup) setup.style.display = "none";
  if (game) game.style.display = "none";

  // Titel + Content setzen
  if (titleEl) titleEl.textContent = "Notizen";

  contentEl.innerHTML = `
    <div id="save-status" style="margin:10px 0; font-size:14px; opacity:.8;"></div>
    <div class="notes-container">
      ${createNoteLines()}
    </div>
  `;

  // close Button: nicht doppelt Listener stapeln
  closeBtn.onclick = () => closeOverlay();

  // Auto-save
  getNoteInputs().forEach((inp) => {
    inp.addEventListener("input", scheduleSave);
  });

  // Laden
  loadNotesFromSupabase();
}

function createNoteLines() {
  let html = "";
  for (let i = 1; i <= 10; i++) {
    html += `
      <input
        type="text"
        maxlength="30"
        placeholder="Notiz ${i}"
        class="note-line"
        data-index="${i - 1}"
      />
    `;
  }
  return html;
}

function getNoteInputs() {
  return Array.from(document.querySelectorAll(".note-line"));
}

function setStatus(text) {
  const el = document.getElementById("save-status");
  if (el) el.textContent = text;
}

function normalizeNotes(notes) {
  const arr = Array(10).fill("");
  for (let i = 0; i < 10; i++) {
    arr[i] = ((notes && notes[i]) ? String(notes[i]) : "").slice(0, 30);
  }
  return arr;
}

function fillInputs(notesArr) {
  getNoteInputs().forEach((inp, idx) => {
    inp.value = (notesArr[idx] || "").slice(0, 30);
  });
}

function collectNotes() {
  return getNoteInputs().map((inp) => (inp.value || "").toString().slice(0, 30));
}

async function loadNotesFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setStatus("Supabase nicht verfügbar.");
    return;
  }

  setStatus("Lade…");

  const { data, error } = await supabase
    .from("field4_notes")
    .select("notes")
    .eq("id", 1)
    .single();

  if (error) {
    // falls row fehlt -> anlegen
    const emptyNotes = Array(10).fill("");
    const up = await supabase.from("field4_notes").upsert({ id: 1, notes: emptyNotes });

    if (up.error) {
      console.error("load error:", error, "upsert error:", up.error);
      setStatus("Fehler beim Laden/Anlegen.");
      return;
    }

    fillInputs(emptyNotes);
    setStatus("Bereit.");
    return;
  }

  fillInputs(normalizeNotes(data?.notes));
  setStatus("Bereit.");
}

function scheduleSave() {
  setStatus("Änderungen…");
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNotesToSupabase, 500);
}

async function saveNotesToSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setStatus("Supabase nicht verfügbar.");
    return;
  }

  setStatus("Speichere…");

  const { error } = await supabase
    .from("field4_notes")
    .upsert({ id: 1, notes: collectNotes() });

  if (error) {
    console.error("save error:", error);
    setStatus("Speichern fehlgeschlagen.");
    return;
  }

  setStatus("Gespeichert.");
}

function closeOverlay() {
  const overlay = document.getElementById("overlay");
  const contentEl = document.getElementById("overlay-content");
  const setup = document.getElementById("setup");

  // Overlay aus
  overlay.style.display = "none";

  // Content leeren (optional)
  if (contentEl) contentEl.innerHTML = "";

  // Trinkspiel Setup wieder zeigen (damit Feld 1 normal bleibt)
  if (setup) setup.style.display = "block";

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
}
