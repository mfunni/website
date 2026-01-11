// feld4.js
(() => {
  // ===============================
  // Feld 4 – Notizen (Supabase REST)
  // 10 Zeilen, max 30 Zeichen, global gespeichert (id=1)
  // ===============================

  // Supabase (eigene Namen, kein Konflikt mit field3.js)
  const SB4_URL = "https://skkdkgirllqyxkyalzfb.supabase.co";
  const SB4_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2RrZ2lybGxxeXhreWFsemZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5ODA2MTQsImV4cCI6MjA4MzU1NjYxNH0.mXx1ZcsZZtIsLP4A-FYu-5U9ZtJztQv7j1l2bpJCc7E";

  const SB4_TABLE = "field4_notes";
  const SB4_ID = 1;

  let saveTimer = null;

  console.log("feld4.js geladen ✅");

  async function renderField4() {
    // Erwartet globals aus script.js (wie bei Feld 3)
    // overlayTitle, overlayContent, openOverlay
    overlayTitle.textContent = "Notizen";

    // Trinkspiel UI ausblenden
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

    const notesWrap = document.getElementById("field4-notes");
    notesWrap.innerHTML = createNoteInputsHtml();

    await loadNotesIntoInputs();

    notesWrap.querySelectorAll(".field4-note").forEach((inp) => {
      inp.addEventListener("input", () => {
        setStatus("Änderungen…");
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

  function setStatus(text) {
    const el = document.getElementById("field4-status");
    if (el) el.textContent = text;
  }

  function getNotesFromInputs() {
    return Array.from(document.querySelectorAll(".field4-note"))
      .map((inp) => (inp.value || "").toString().slice(0, 30));
  }

  function fillInputs(notesArr) {
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
        setStatus("Gespeichert ✅");
      } catch (e) {
        console.error(e);
        setStatus("Speichern fehlgeschlagen ❌ (Konsole prüfen)");
      }
    }, 500);
  }

  async function supabaseSelectNotes() {
    const url = `${SB4_URL}/rest/v1/${SB4_TABLE}?id=eq.${SB4_ID}&select=notes`;

    const res = await fetch(url, {
      headers: {
        apikey: SB4_KEY,
        Authorization: `Bearer ${SB4_KEY}`,
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

  async function supabaseUpsertNotes(notesArr) {
    const url = `${SB4_URL}/rest/v1/${SB4_TABLE}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: SB4_KEY,
        Authorization: `Bearer ${SB4_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: SB4_ID,
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
    setStatus("Lade…");
    try {
      const notes = await supabaseSelectNotes();

      if (notes) {
        fillInputs(notes);
        setStatus("Bereit");
        return;
      }

      const empty = Array(10).fill("");
      await supabaseUpsertNotes(empty);
      fillInputs(empty);
      setStatus("Bereit");
    } catch (e) {
      console.error(e);
      setStatus("Fehler beim Laden ❌ (Konsole prüfen)");
    }
  }

  // Klick-Handler
  document.addEventListener("DOMContentLoaded", () => {
    const tile4 = document.getElementById("tile-4");
    if (!tile4) return;

    tile4.addEventListener("click", async () => {
      console.log("tile-4 klick ✅");
      await renderField4();
      openOverlay();
    });
  });
})();
