const STORAGE_KEY = "k8s-test-notes";
const COLORS = ["#ffffff", "#ffe8a3", "#c8f4de", "#d3e4ff", "#ffd6d6", "#e8d9ff"];

const board = document.getElementById("board");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("search");
const modalBackdrop = document.getElementById("modalBackdrop");
const noteTitleInput = document.getElementById("noteTitle");
const noteBodyInput = document.getElementById("noteBody");
const colorSwatches = document.getElementById("colorSwatches");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");
const newNoteBtn = document.getElementById("newNoteBtn");

let notes = loadNotes();
let editingId = null;
let selectedColor = COLORS[0];

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function render(filter = "") {
  const q = filter.trim().toLowerCase();
  const visible = notes
    .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  board.innerHTML = "";
  emptyState.hidden = notes.length > 0;

  for (const note of visible) {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.setProperty("--card-color", note.color);
    card.innerHTML = `
      <h3></h3>
      <p></p>
      <div class="note-meta"></div>
    `;
    card.querySelector("h3").textContent = note.title || "Untitled";
    card.querySelector("p").textContent = note.body;
    card.querySelector(".note-meta").textContent = `Updated ${formatDate(note.updatedAt)}`;
    card.addEventListener("click", () => openModal(note.id));
    board.appendChild(card);
  }
}

function buildSwatches() {
  colorSwatches.innerHTML = "";
  for (const color of COLORS) {
    const el = document.createElement("div");
    el.className = "swatch";
    el.style.background = color;
    el.dataset.color = color;
    if (color === selectedColor) el.classList.add("selected");
    el.addEventListener("click", () => {
      selectedColor = color;
      [...colorSwatches.children].forEach((c) => c.classList.remove("selected"));
      el.classList.add("selected");
    });
    colorSwatches.appendChild(el);
  }
}

function openModal(id = null) {
  editingId = id;
  if (id) {
    const note = notes.find((n) => n.id === id);
    noteTitleInput.value = note.title;
    noteBodyInput.value = note.body;
    selectedColor = note.color;
    deleteBtn.hidden = false;
  } else {
    noteTitleInput.value = "";
    noteBodyInput.value = "";
    selectedColor = COLORS[0];
    deleteBtn.hidden = true;
  }
  buildSwatches();
  modalBackdrop.hidden = false;
  noteTitleInput.focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
  editingId = null;
}

function saveNote() {
  const title = noteTitleInput.value.trim();
  const body = noteBodyInput.value.trim();
  if (!title && !body) {
    closeModal();
    return;
  }

  if (editingId) {
    const note = notes.find((n) => n.id === editingId);
    note.title = title;
    note.body = body;
    note.color = selectedColor;
    note.updatedAt = Date.now();
  } else {
    notes.push({
      id: crypto.randomUUID(),
      title,
      body,
      color: selectedColor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  saveNotes();
  render(searchInput.value);
  closeModal();
}

function deleteNote() {
  notes = notes.filter((n) => n.id !== editingId);
  saveNotes();
  render(searchInput.value);
  closeModal();
}

newNoteBtn.addEventListener("click", () => openModal());
cancelBtn.addEventListener("click", closeModal);
saveBtn.addEventListener("click", saveNote);
deleteBtn.addEventListener("click", deleteNote);
searchInput.addEventListener("input", (e) => render(e.target.value));
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

render();
