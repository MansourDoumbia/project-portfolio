async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function pill(text) {
  const span = document.createElement("span");
  span.className = "pill";
  span.textContent = text;
  return span;
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
  a.href = `project.html?id=${encodeURIComponent(p.id)}`;

  const h = document.createElement("h3");
  h.textContent = p.title;

  const meta = document.createElement("p");
  meta.className = "muted small";
  meta.textContent = [p.org, p.role, p.dates].filter(Boolean).join(" • ");

  const s = document.createElement("p");
  s.className = "muted";
  s.textContent = p.summary || "";

  const chips = document.createElement("div");
  chips.className = "chips";
  (p.tags || []).slice(0, 5).forEach(t => chips.appendChild(chip(t)));

  a.appendChild(h);
  a.appendChild(meta);
  a.appendChild(s);
  a.appendChild(chips);
  return a;
}

(async function init() {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Site content
  const site = await loadJSON("data/site.json");

  const brand = document.getElementById("brandName");
  if (brand) brand.textContent = site.nameShort || "Portfolio";

  const eyebrow = document.getElementById("eyebrow");
  const headline = document.getElementById("headline");
  const tagline = document.getElementById("tagline");
  if (eyebrow) eyebrow.textContent = site.eyebrow || "";
  if (headline) headline.textContent = site.headline || "";
  if (tagline) tagline.textContent = site.tagline || "";

  const resumeLink = document.getElementById("resumeLink");
  if (resumeLink) resumeLink.href = site.resumeUrl || "#";

  const emailLink = document.getElementById("emailLink");
  if (emailLink) {
    const email = site.email || "";
    emailLink.textContent = email || "you@example.com";
    emailLink.href = email ? `mailto:${email}` : "#";
  }

  const locationText = document.getElementById("locationText");
  if (locationText) locationText.textContent = site.location || "";

  const githubLink = document.getElementById("githubLink");
  if (githubLink) githubLink.href = site.githubUrl || "#";

  const linkedinLink = document.getElementById("linkedinLink");
  if (linkedinLink) linkedinLink.href = site.linkedinUrl || "#";

  const aboutText = document.getElementById("aboutText");
  if (aboutText && site.about) aboutText.textContent = site.about;

  const strengthsList = document.getElementById("strengthsList");
  if (strengthsList && Array.isArray(site.strengths)) {
    strengthsList.innerHTML = "";
    site.strengths.forEach(x => {
      const li = document.createElement("li");
      li.textContent = x;
      strengthsList.appendChild(li);
    });
  }

  const toolsChips = document.getElementById("toolsChips");
  if (toolsChips && Array.isArray(site.tools)) {
    toolsChips.innerHTML = "";
    site.tools.forEach(t => toolsChips.appendChild(chip(t)));
  }

  const quickFacts = document.getElementById("quickFacts");
  if (quickFacts && Array.isArray(site.quickFacts)) {
    quickFacts.innerHTML = "";
    site.quickFacts.forEach(q => quickFacts.appendChild(pill(q)));
  }

  // Courses (hide card if none)
  const coursesCard = document.getElementById("coursesCard");
  const coursesList = document.getElementById("coursesList");
  if (coursesCard && coursesList) {
    if (Array.isArray(site.courses) && site.courses.length) {
      coursesList.innerHTML = "";
      site.courses.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        coursesList.appendChild(li);
      });
    } else {
      coursesCard.style.display = "none";
    }
  }

  // Featured projects
  const data = await loadJSON("data/projects.json");
  const allProjects = Array.isArray(data.projects) ? data.projects : [];

  let featured = allProjects.filter(p => p.featured);

  // If you use featuredOrder, sort by it (lower = earlier)
  featured.sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999));

  // Fallback: if none marked featured, show first 6 projects
  if (!featured.length) featured = allProjects.slice(0, 6);

  const grid = document.getElementById("featuredGrid");
  if (grid) {
    grid.innerHTML = "";
    featured.slice(0, 6).forEach(p => grid.appendChild(projectCard(p)));
  }
})().catch(err => {
  console.error(err);
});
function pickProjectThumb(p) {
  const photos = Array.isArray(p.photos) ? p.photos : [];
  const hero = photos.find(x => x.hero) || photos[0];
  return hero ? hero.src : null;
}

function projectCard(p) {
  const a = document.createElement("a");
  a.className = "card project-card";
  a.href = `project.html?id=${encodeURIComponent(p.id)}`;

  const thumbSrc = pickProjectThumb(p);
  if (thumbSrc) {
    const img = document.createElement("img");
    img.className = "project-thumb";
    img.src = thumbSrc;
    img.alt = (Array.isArray(p.photos) && p.photos[0] && p.photos[0].alt) ? p.photos[0].alt : `${p.title} thumbnail`;
    img.loading = "lazy";
    a.appendChild(img);
  }

  const content = document.createElement("div");

  const h = document.createElement("h3");
  h.textContent = p.title;

  const meta = document.createElement("p");
  meta.className = "muted small";
  meta.textContent = [p.org, p.role, p.dates].filter(Boolean).join(" • ");

  const s = document.createElement("p");
  s.className = "muted";
  s.textContent = p.summary || "";

  const chips = document.createElement("div");
  chips.className = "chips";
  (p.tags || []).slice(0, 5).forEach(t => chips.appendChild(chip(t)));

  content.appendChild(h);
  content.appendChild(meta);
  content.appendChild(s);
  content.appendChild(chips);

  a.appendChild(content);
  return a;
}
