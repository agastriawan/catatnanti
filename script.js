// ===== CatatNanti — vanilla JS, localStorage only =====

const STORAGE_KEY = "catatnanti_notes";

// ----- State -----
let notes = loadNotes();
let currentFilter = "all";

// ----- DOM refs -----
const form = document.getElementById("note-form");
const idInput = document.getElementById("note-id");
const titleInput = document.getElementById("note-title");
const descInput = document.getElementById("note-desc");
const reminderInput = document.getElementById("note-reminder");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const listEl = document.getElementById("note-list");
const emptyState = document.getElementById("empty-state");
const filterBtns = document.querySelectorAll(".filter-btn");
const toast = document.getElementById("toast");

// ----- Storage helpers -----
function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal membaca localStorage:", e);
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Gagal menyimpan ke localStorage:", e);
    showToast("Gagal menyimpan data ⚠️");
  }
}

// ----- Utils -----
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 2000);
}

function formatReminder(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function isOverdue(note) {
  return note.reminder && !note.done && new Date(note.reminder) < new Date();
}

// ----- Render -----
function render() {
  const filtered = notes.filter(n => {
    if (currentFilter === "pending") return !n.done;
    if (currentFilter === "done") return n.done;
    return true;
  });

  // urutkan: belum selesai dulu, lalu berdasarkan pengingat terdekat, lalu terbaru
  filtered.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.reminder && b.reminder) return new Date(a.reminder) - new Date(b.reminder);
    if (a.reminder) return -1;
    if (b.reminder) return 1;
    return b.createdAt - a.createdAt;
  });

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    emptyState.textContent = notes.length === 0
      ? "Belum ada catatan. Yuk tambahkan yang pertama! 🎯"
      : "Tidak ada catatan pada kategori ini.";
    return;
  }
  emptyState.classList.add("hidden");

  filtered.forEach(note => {
    listEl.appendChild(renderNoteItem(note));
  });
}

function renderNoteItem(note) {
  const overdue = isOverdue(note);

  const item = document.createElement("div");
  item.className = "note-item" + (note.done ? " done" : "") + (overdue ? " overdue" : "");
  item.dataset.id = note.id;

  const top = document.createElement("div");
  top.className = "note-top";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "note-check";
  check.checked = note.done;
  check.addEventListener("change", () => toggleDone(note.id));

  const content = document.createElement("div");
  content.className = "note-content";

  const title = document.createElement("p");
  title.className = "note-title";
  title.textContent = note.title;

  content.appendChild(title);

  if (note.desc) {
    const desc = document.createElement("p");
    desc.className = "note-desc";
    desc.textContent = note.desc;
    content.appendChild(desc);
  }

  if (note.reminder) {
    const reminder = document.createElement("span");
    reminder.className = "note-reminder" + (overdue ? " overdue" : "");
    reminder.textContent = (overdue ? "⏰ Terlewat: " : "⏰ ") + formatReminder(note.reminder);
    content.appendChild(reminder);
  }

  const actions = document.createElement("div");
  actions.className = "note-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn";
  editBtn.textContent = "✏️ Edit";
  editBtn.addEventListener("click", () => startEdit(note.id));

  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn delete";
  delBtn.textContent = "🗑️ Hapus";
  delBtn.addEventListener("click", () => deleteNote(note.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  content.appendChild(actions);

  top.appendChild(check);
  top.appendChild(content);
  item.appendChild(top);

  return item;
}

// ----- CRUD actions -----
function addNote(data) {
  notes.push({
    id: generateId(),
    title: data.title,
    desc: data.desc,
    reminder: data.reminder || null,
    done: false,
    createdAt: Date.now()
  });
  saveNotes();
  render();
  showToast("Catatan ditambahkan ✅");
}

function updateNote(id, data) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  note.title = data.title;
  note.desc = data.desc;
  note.reminder = data.reminder || null;
  saveNotes();
  render();
  showToast("Catatan diperbarui ✏️");
}

function deleteNote(id) {
  if (!confirm("Hapus catatan ini?")) return;
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  render();
  showToast("Catatan dihapus 🗑️");
}

function toggleDone(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  note.done = !note.done;
  saveNotes();
  render();
}

// ----- Edit mode -----
function startEdit(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  idInput.value = note.id;
  titleInput.value = note.title;
  descInput.value = note.desc || "";
  reminderInput.value = note.reminder ? note.reminder.slice(0, 16) : "";

  submitBtn.textContent = "Simpan Perubahan";
  cancelEditBtn.classList.remove("hidden");
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  form.reset();
  idInput.value = "";
  submitBtn.textContent = "Tambah Catatan";
  cancelEditBtn.classList.add("hidden");
}

// ----- Events -----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    title: titleInput.value.trim(),
    desc: descInput.value.trim(),
    reminder: reminderInput.value || null
  };
  if (!data.title) return;

  const editingId = idInput.value;
  if (editingId) {
    updateNote(editingId, data);
  } else {
    addNote(data);
  }
  resetForm();
});

cancelEditBtn.addEventListener("click", resetForm);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ----- Init -----
render();
