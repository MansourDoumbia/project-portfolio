async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
  return res.json();
}

function chip(text) {
  const span = document.createElement("span");
  span.className = "chip";
  span.textContent = text;
  return span;
}

function projectCard(p) {
  const a = document.createElement("a");
  a.className = "card project-card";
  a.href = `project.html?id=${encodeURIComponent(p.id || "")}`;

  const h = document.createElement("h3");
  h.textContent = p.title || "(Untitled project)";

  const meta = document.createElement("p");
  meta.className = "muted small";
  meta.textContent = [p.org, p.role, p.dates].filter(Boolean).join(" • ");

  const s = document.createElement("p");
  s.className = "muted";
  s.textContent = p.summary || "";

  const chips = document.createElement("div");
  chips.className = "chips";
  (p.tags || []).slice(0, 6).forEach(t => chips.appendChild(chip(t)));

  a.appendChild(h);
  a.appendChild(meta);
  a.appendChild(s);
  a.appendChild(chips);
  return a;
}

function uniqueTags(projects) {
  const set = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

// Optional: derive a sortable key if sortKey is missing.
// Prefers sortKey, then tries YYYY or YYYY-MM found in dates, else empty string.
function getRecentKey(p) {
  if (p.sortKey) return String(p.sortKey);
  const d = String(p.dates || "");
  const m = d.match(/\b(20\d{2})(?:[-/](0[1-9]|1[0-2]))?\b/); // matches 2024 or 2024-05
  if (!m) return "";
  const year = m[1];
  const month = m[2] || "01";
  return `${year}-${month}`;
}

(async function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const brand = document.getElementById("brandName");
  try {
    const site = await loadJSON("data/site.json");
    if (brand) brand.textContent = site.nameShort || "Portfolio";
  } catch (e) {
    // Non-fatal: allow projects page to work even if site.json is missing
    console.warn(e);
  }

  const grid = document.getElementById("projectsGrid");
  const countText = document.getElementById("countText");
  const searchInput = document.getElementById("searchInput");
  const tagSelect = document.getElementById("tagSelect");
  const sortSelect = document.getElementById("sortSelect");

  if (!grid || !countText || !searchInput || !tagSelect || !sortSelect) {
    throw new Error("Missing required DOM elements for projects page.");
  }

  const data = await loadJSON("data/projects.json");

  // Validate shape
  const projects = Array.isArray(data.projects) ? data.projects : [];
  if (!projects.length) {
    grid.innerHTML =
      `<div class="card">
         <h2>No projects found</h2>
         <p class="muted">Loaded data/projects.json, but it did not contain a non-empty "projects" array.</p>
       </div>`;
    countText.textContent = "0 project(s) shown";
    return;
  }

  // Populate tag filter
  uniqueTags(projects).forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    tagSelect.appendChild(opt);
  });

  function render() {
    const q = normalize(searchInput.value);
    const tag = tagSelect.value;
    const sort = sortSelect.value;

    let filtered = projects.filter(p => {
      const hay = normalize([
        p.title, p.org, p.role, p.dates, p.summary,
        ...(p.tags || []), ...(p.tools || [])
      ].join(" "));
      const qOK = !q || hay.includes(q);
      const tagOK = !tag || (p.tags || []).includes(tag);
      return qOK && tagOK;
    });

    if (sort === "title") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      // "recent": sort by sortKey if present, otherwise derive from dates
      filtered.sort((a, b) => getRecentKey(b).localeCompare(getRecentKey(a)));
    }

    grid.innerHTML = "";
    filtered.forEach(p => grid.appendChild(projectCard(p)));
    countText.textContent = `${filtered.length} project(s) shown`;
  }

  searchInput.addEventListener("input", render);
  tagSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);

  render();
})().catch(err => {
  console.error(err);
  const grid = document.getElementById("projectsGrid");
  const countText = document.getElementById("countText");
  if (grid) {
    grid.innerHTML =
      `<div class="card">
         <h2>Error</h2>
         <p class="muted">${err.message}</p>
       </div>`;
  }
  if (countText) countText.textContent = "0 project(s) shown";
});
