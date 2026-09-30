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

function pickProjectThumb(p) {
  const photos = Array.isArray(p.photos) ? p.photos : [];
  const hero = photos.find(x => x.hero) || photos[0];
  return hero ? hero.src : null;
}

function youtubeUrlFromVideo(v) {
  if (!v) return null;

  if (v.youtubeId) {
    const t = Number.isFinite(v.startSeconds) ? Math.max(0, v.startSeconds) : null;
    return `https://www.youtube.com/watch?v=${encodeURIComponent(v.youtubeId)}${t ? `&t=${t}s` : ""}`;
  }

  if (v.url) return v.url;
  if (v.href) return v.href;

  return null;
}

function projectCard(p) {
  const a = document.createElement("a");
  a.className = "card project-card";
  a.href = `project.html?id=${encodeURIComponent(p.id || "")}`;

  const thumbSrc = pickProjectThumb(p);
  if (thumbSrc) {
    a.classList.add("has-thumb");
    const img = document.createElement("img");
    img.className = "project-thumb";
    img.src = thumbSrc;
    img.alt =
      (Array.isArray(p.photos) && p.photos[0] && p.photos[0].alt)
        ? p.photos[0].alt
        : `${p.title || "Project"} thumbnail`;
    img.loading = "lazy";
    a.appendChild(img);
  } else {
    a.classList.add("no-thumb");
  }

  const content = document.createElement("div");

  const h = document.createElement("h3");
  h.textContent = p.title || "(Untitled project)";

  const meta = document.createElement("p");
  meta.className = "muted small";
  meta.textContent = [p.org, p.role, p.dates].filter(Boolean).join(" | ");

  const s = document.createElement("p");
  s.className = "muted";
  s.textContent = p.summary || "";

  const chipsWrap = document.createElement("div");
  chipsWrap.className = "chips";
  (p.tags || []).slice(0, 5).forEach(t => chipsWrap.appendChild(chip(t)));

  const vids = Array.isArray(p.videos) ? p.videos : [];
  if (vids.length) {
    chipsWrap.appendChild(chip("Video"));

    const firstUrl = youtubeUrlFromVideo(vids[0]);
    if (firstUrl) {
      const watch = document.createElement("a");
      watch.href = firstUrl;
      watch.target = "_blank";
      watch.rel = "noopener";
      watch.className = "chip";
      watch.textContent = "Watch";
      watch.addEventListener("click", (e) => e.stopPropagation());
      chipsWrap.appendChild(watch);
    }
  }

  content.appendChild(h);
  content.appendChild(meta);
  content.appendChild(s);
  content.appendChild(chipsWrap);

  a.appendChild(content);
  return a;
}

function renderEducation(site) {
  const educationCard = document.getElementById("educationCard");
  const educationText = document.getElementById("educationText");
  const ed = site.education || {};

  if (!educationCard || !educationText) return;

  const line = [
    ed.school,
    ed.degree,
    ed.expected,
    ed.gpa ? `GPA: ${ed.gpa}` : ""
  ].filter(Boolean).join(" | ");

  if (line) {
    educationText.textContent = line;
  } else {
    educationCard.style.display = "none";
  }
}

function experienceCard(item) {
  const article = document.createElement("article");
  article.className = "card experience-card";

  const header = document.createElement("div");
  header.className = "experience-card-header";

  const titleWrap = document.createElement("div");
  const h = document.createElement("h3");
  h.textContent = item.org || "";
  const role = document.createElement("p");
  role.className = "muted small";
  role.textContent = [item.role, item.location].filter(Boolean).join(" | ");
  titleWrap.appendChild(h);
  titleWrap.appendChild(role);

  const dates = document.createElement("p");
  dates.className = "muted small experience-dates";
  dates.textContent = item.dates || "";

  header.appendChild(titleWrap);
  header.appendChild(dates);
  article.appendChild(header);

  const list = document.createElement("ul");
  list.className = "list";
  (item.bullets || []).forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
  article.appendChild(list);

  return article;
}

(async function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  const phoneLink = document.getElementById("phoneLink");
  if (phoneLink) {
    const phone = site.phone || "";
    phoneLink.textContent = phone || "";
    phoneLink.href = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "#";
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

  renderEducation(site);

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

  const experienceList = document.getElementById("experienceList");
  if (experienceList && Array.isArray(site.experience)) {
    experienceList.innerHTML = "";
    site.experience.forEach(item => experienceList.appendChild(experienceCard(item)));
  }

  const data = await loadJSON("data/projects.json");
  const allProjects = Array.isArray(data.projects) ? data.projects : [];

  let featured = allProjects.filter(p => p.featured);
  featured.sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999));
  if (!featured.length) featured = allProjects.slice(0, 6);

  const grid = document.getElementById("featuredGrid");
  if (grid) {
    grid.innerHTML = "";
    featured.slice(0, 6).forEach(p => grid.appendChild(projectCard(p)));
  }
})().catch(err => {
  console.error(err);
});
