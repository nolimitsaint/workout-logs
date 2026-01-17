const STORAGE_KEY = "workoutLogs_v1";

/* =========================
   SEED DATA
========================= */
function generateSeedData() {
  const exercises = [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Pull Ups",
    "Shoulder Press",
    "Incline DB Press",
  ];

  const data = [];

  for (let i = 1; i <= 30; i++) {
    const ex = exercises[i % exercises.length];
    data.push({
      id: i,
      date: `2026-01-${String((i % 12) + 1).padStart(2, "0")}`,
      exercise: ex,
      sets: (i % 5) + 1,
      reps: (i % 10) + 1,
      weight: 95 + (i % 8) * 10,
    });
  }
  return data;
}

/* =========================
   LOCAL STORAGE
========================= */
function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  const seeded = generateSeedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/* =========================
   STATE
========================= */
let records = loadRecords();
let editingId = null;

/* =========================
   HELPERS
========================= */
function getNextId() {
  const maxId = records.reduce((max, r) => Math.max(max, r.id), 0);
  return maxId + 1;
}

function isValidWorkout(w) {
  if (!w.date || !w.exercise) return false;
  if (Number.isNaN(w.sets) || w.sets < 1 || w.sets > 20) return false;
  if (Number.isNaN(w.reps) || w.reps < 1 || w.reps > 50) return false;
  if (Number.isNaN(w.weight) || w.weight < 0 || w.weight > 1000) return false;
  return true;
}

/* =========================
   RENDER (READ)
========================= */
function renderList() {
  const listEl = document.getElementById("list");

  const rows = records
    .map(
      (r) => `
        <tr>
          <td>${r.date}</td>
          <td>${r.exercise}</td>
          <td>${r.sets}</td>
          <td>${r.reps}</td>
          <td>${r.weight}</td>
          <td>
            <button class="editBtn" data-id="${r.id}">Edit</button>
            <button class="deleteBtn" data-id="${r.id}">Delete</button>
          </td>
        </tr>
      `
    )
    .join("");

  listEl.innerHTML = `
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Date</th>
          <th>Exercise</th>
          <th>Sets</th>
          <th>Reps</th>
          <th>Weight</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/* =========================
   STATS (ANIMATED)
========================= */
function animateStats() {
  const els = document.querySelectorAll(".stat-value");

  els.forEach((el) => {
    const target = Number(el.dataset.target || 0);
    const decimals = Number(el.dataset.decimals || 0);

    const start = 0;
    const durationMs = 650;
    const startTime = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

      const value = start + (target - start) * eased;
      el.textContent = value.toFixed(decimals);

      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function renderStats() {
  const statsEl = document.getElementById("stats");

  const total = records.length;
  const totalWeight = records.reduce((sum, r) => sum + Number(r.weight || 0), 0);
  const avgWeight = total === 0 ? 0 : totalWeight / total;

  statsEl.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Total Workouts</span>
      <span class="stat-value" data-target="${total}" data-decimals="0">0</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">Average Weight (lbs)</span>
      <span class="stat-value" data-target="${avgWeight}" data-decimals="1">0</span>
    </div>
  `;

  animateStats();
}

/* =========================
   EDIT HELPERS
========================= */
function setFormValues(workout) {
  document.getElementById("date").value = workout.date;
  document.getElementById("exercise").value = workout.exercise;
  document.getElementById("sets").value = workout.sets;
  document.getElementById("reps").value = workout.reps;
  document.getElementById("weight").value = workout.weight;
}

function setEditMode(on) {
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  if (on) {
    submitBtn.textContent = "Update Workout";
    cancelBtn.style.display = "inline-block";
  } else {
    submitBtn.textContent = "Add Workout";
    cancelBtn.style.display = "none";
  }
}

/* =========================
   CREATE / UPDATE
========================= */
const form = document.getElementById("workoutForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const workoutFromForm = {
    id: editingId ?? getNextId(),
    date: document.getElementById("date").value,
    exercise: document.getElementById("exercise").value.trim(),
    sets: Number(document.getElementById("sets").value),
    reps: Number(document.getElementById("reps").value),
    weight: Number(document.getElementById("weight").value),
  };

  if (!isValidWorkout(workoutFromForm)) {
    alert("Please enter valid workout info (check required fields and number ranges).");
    return;
  }

  if (editingId === null) {
    // CREATE
    records.push(workoutFromForm);
  } else {
    // UPDATE
    records = records.map((r) => (r.id === editingId ? workoutFromForm : r));
    editingId = null;
    setEditMode(false);
  }

  saveRecords(records);
  renderList();
  renderStats();
  form.reset();
});

/* =========================
   LIST CLICK HANDLERS (EDIT + DELETE)
========================= */
document.getElementById("list").addEventListener("click", (e) => {
  // DELETE
  const delBtn = e.target.closest(".deleteBtn");
  if (delBtn) {
    const idToDelete = Number(delBtn.dataset.id);
    const workout = records.find((r) => r.id === idToDelete);
    if (!workout) return;

    const ok = confirm(
      `Delete this workout?\n\n${workout.date} — ${workout.exercise} (${workout.sets}x${workout.reps} @ ${workout.weight} lbs)`
    );
    if (!ok) return;

    records = records.filter((r) => r.id !== idToDelete);
    saveRecords(records);
    renderList();
    renderStats();
    return;
  }

  // EDIT
  const editBtn = e.target.closest(".editBtn");
  if (editBtn) {
    const idToEdit = Number(editBtn.dataset.id);
    const workout = records.find((r) => r.id === idToEdit);
    if (!workout) return;

    editingId = idToEdit;
    setFormValues(workout);
    setEditMode(true);
  }
});

/* =========================
   CANCEL EDIT
========================= */
document.getElementById("cancelBtn").addEventListener("click", () => {
  editingId = null;
  setEditMode(false);
  form.reset();
});

/* =========================
   INITIAL LOAD
========================= */
renderList();
renderStats();

