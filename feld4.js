// feld4.js

const tile4 = document.getElementById("tile-4");
const overlay = document.getElementById("overlay");

// 1) Supabase Client holen oder erstellen (wie Feld 3)
function getSupabaseClient() {
  if (window.supabaseClient) return window.supabaseClient;

  // Falls du keine globale Instanz verwendest, aber SUPABASE_URL + SUPABASE_ANON_KEY global existieren:
  if (typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined") {
    // supabase-js v2: createClient kommt entweder global oder über window.supabase
    const create =
      (typeof createClient !== "undefined" && createClient) ||
      (window.supabase && window.supabase.createClient);

    if (!create) {
      console.error("Supabase createClient nicht gefunden. Stelle sicher, dass supabase-js eingebunden ist.");
      return null;
    }

    const client = create(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = client; // optional cachen
    return client;
  }

  console.error("Supabase Konfiguration fehlt (window.supabaseClient ODER SUPABASE_URL + SUPABASE_ANON_KEY).");
  return null;
}

let saveTimer = null;

tile4.addEventListener("click", () => {
  openNotes();
});

async function openNotes() {
  overlay.classList.add("active");

  overlay.innerHTML = `
    <div class="overlay-content">
      <h2>Notizen</h2>

      <div id="save-status" style="margin: 10px 0; font-size: 14px; opacity: 0.8;"></div>

      <div class="notes-container">
        ${createNoteLines()}
      </div>

      <button id="close-overlay">Schließen</button>
    </div>
  `;

  document.getElementById("close-overlay").addEventListener("click", closeOverlay);

  // Auto-Save beim Tippen (debounced)
  getNoteInputs().forEach((inp) => inp.addEventListener("input", scheduleSave));

  // Laden
  await loadNotesFromSupabase();
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
  const inputs = getNoteInputs();
  inputs.forEach((inp, idx) => {
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

  // Wir nutzen eine feste Zeile id=1 als globalen Speicher
  const { data, error } = await supabase
    .from("field4_notes")
    .select("notes")
    .eq("id", 1)
    .single();

  if (error) {
    // Falls die Zeile noch nicht existiert: anlegen
    const emptyNotes = Array(10).fill("");
    const up = await supabase.from("field4_notes").upsert({ id: 1, notes: emptyNotes });

    if (up.error) {
      console.error("loadNotes error:", error, "upsert error:", up.error);
      setStatus("Fehler beim Laden/Anlegen.");
      return;
    }

    fillInputs(emptyNotes);
    setStatus("Bereit.");
    return;
  }

  const normalized = normalizeNotes(data?.notes);
  fillInputs(normalized);
  setStatus("Bereit.");
}

function scheduleSave() {
  setStatus("Änderungen…");

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveNotesToSupabase();
  }, 500);
}

async function saveNotesToSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setStatus("Supabase nicht verfügbar.");
    return;
  }

  const notes = collectNotes();
  setStatus("Speichere…");

  const { error } = await supabase
    .from("field4_notes")
    .upsert({ id: 1, notes });

  if (error) {
    console.error("saveNotes error:", error);
    setStatus("Speichern fehlgeschlagen.");
    return;
  }

  setStatus("Gespeichert.");
}

function closeOverlay() {
  overlay.classList.remove("active");
  overlay.innerHTML = "";
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
}
