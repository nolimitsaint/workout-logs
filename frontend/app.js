/**
 * Workout Logs (Solo Project 1 - CPSC 3750)
 * Runs locally on XAMPP (Apache) and stores data in localStorage.
 * Domain: workout logs (date, exercise, sets, reps, weight)
 *
 * Core features:
 * - CRUD: Create, Read, Update, Delete
 * - Persistence: localStorage (data survives refresh)
 * - Seed data: starts with 30 records on first load
 * - Stats view: total workouts + average weight with animation
 */


// Change this after backend deployment (Render/Railway/etc)
const API_BASE = "http://127.0.0.1:5000";

const PAGE_SIZE = 10;

let currentPage = 1;
let totalRecords = 0;
let editingId = null;

/* =========================
   VALIDATION (client side)
========================= */
function isValidWorkout(w) {
  if (!w.date || !w.exercise) return false;
  if (Number.isNaN(w.sets) || w.sets < 1 || w.sets > 20) return false;
  if (Number.isNaN(w.reps) || w.reps < 1 || w.reps > 50) return false;
  if (Number.isNaN(w.weight) || w.weight < 0 || w.weight > 1000) return false;
  return true;
}

function showError(msg) {
  const el = document.getElementById("formError");
  if (!msg) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  el.style.display = "block";
  el.textContent = msg;
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
   RENDER LIST
========================= */
function renderList(recordsOnPage) {
  const listEl = document.getElementById("list");

  const rows = recordsOnPage
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
      const eased = 1 - Math.pow(1 - t, 3);
      const value = start + (target - start) * eased;
      el.textContent = value.toFixed(decimals);

      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function renderStats(total, avgWeight) {
  const statsEl = document.getElementById("stats");

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
   PAGER UI
========================= */
function updatePagerUI() {
  const maxPage = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${maxPage}`;
  document.getElementById("prevPage").disabled = currentPage <= 1;
  document.getElementById("nextPage").disabled = currentPage >= maxPage;
}

/* =========================
   API CALLS
========================= */
async function fetchPage(page) {
  const res = await fetch(`${API_BASE}/api/workouts?page=${page}&limit=${PAGE_SIZE}`);
  const data = await res.json();

  totalRecords = data.total;
  currentPage = data.page;

  renderList(data.records);
  updatePagerUI();
}

async function fetchStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  const data = await res.json();
  renderStats(data.total, data.avgWeight);
}

/* =========================
   FORM SUBMIT (CREATE / UPDATE)
========================= */
const form = document.getElementById("workoutForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");

  const workoutFromForm = {
    date: document.getElementById("date").value,
    exercise: document.getElementById("exercise").value.trim(),
    sets: Number(document.getElementById("sets").value),
    reps: Number(document.getElementById("reps").value),
    weight: Number(document.getElementById("weight").value),
  };

  if (!isValidWorkout(workoutFromForm)) {
    showError("Please enter valid workout info (check required fields and number ranges).");
    return;
  }

  try {
    if (editingId === null) {
      // CREATE
      const res = await fetch(`${API_BASE}/api/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutFromForm),
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Create failed.");
        return;
      }
    } else {
      // UPDATE
      const res = await fetch(`${API_BASE}/api/workouts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutFromForm),
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Update failed.");
        return;
      }

      editingId = null;
      setEditMode(false);
    }

    form.reset();
    await fetchPage(currentPage);
    await fetchStats();
  } catch (err) {
    showError("Network error: could not reach backend API.");
  }
});

/* =========================
   LIST CLICK (EDIT + DELETE)
========================= */
document.getElementById("list").addEventListener("click", async (e) => {
  // DELETE
  const delBtn = e.target.closest(".deleteBtn");
  if (delBtn) {
    const idToDelete = Number(delBtn.dataset.id);

    const ok = confirm("Delete this workout?");
    if (!ok) return;

    const res = await fetch(`${API_BASE}/api/workouts/${idToDelete}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Delete failed.");
      return;
    }

    // handle paging edge case (deleted last item on last page)
    const maxPageAfter = Math.max(1, Math.ceil((totalRecords - 1) / PAGE_SIZE));
    if (currentPage > maxPageAfter) currentPage = maxPageAfter;

    await fetchPage(currentPage);
    await fetchStats();
    return;
  }

  // EDIT
  const editBtn = e.target.closest(".editBtn");
  if (editBtn) {
    const idToEdit = Number(editBtn.dataset.id);

    // Fetch current page again and find workout by id
    const res = await fetch(`${API_BASE}/api/workouts?page=${currentPage}&limit=${PAGE_SIZE}`);
    const data = await res.json();
    const workout = data.records.find((r) => r.id === idToEdit);
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
  showError("");
});

/* =========================
   PAGER EVENTS
========================= */
document.getElementById("prevPage").addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    await fetchPage(currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", async () => {
  const maxPage = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  if (currentPage < maxPage) {
    currentPage++;
    await fetchPage(currentPage);
  }
});

/* =========================
   INITIAL LOAD
========================= */
(async function init() {
  await fetchPage(currentPage);
  await fetchStats();
})();

async function loadStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  const stats = await res.json();

  document.getElementById("stats").innerHTML = `
    <div class="stat-card">
      <h3>Total Workouts</h3>
      <p>${stats.total}</p>
    </div>

    <div class="stat-card">
      <h3>Average Weight (lbs)</h3>
      <p>${stats.averageWeight}</p>
    </div>
  `;
}
loadStats();
