<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SkillBridge — Full Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ═══════════════════════════════════════
   SPLASH STYLES
═══════════════════════════════════════ */
#curtain {
  position: fixed; inset: 0; z-index: 10000;
  background: #0a0a0f;
  transform: scaleY(0);
  transform-origin: bottom;
  pointer-events: none;
}
#curtain.rise {
  pointer-events: auto;
  transform: scaleY(1);
  transition: transform 0.52s cubic-bezier(0.76,0,0.24,1);
}
#curtain.fall {
  transform-origin: top;
  transform: scaleY(0);
  transition: transform 0.52s cubic-bezier(0.76,0,0.24,1);
}

#splash {
  position: fixed; inset: 0; z-index: 9999;
  background: #0a0a0f;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

.sp-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(247,246,242,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(247,246,242,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: grid-drift 8s linear infinite;
}
@keyframes grid-drift { to { background-position: 48px 48px; } }

.sp-orb {
  position: absolute; border-radius: 50%; filter: blur(90px);
  animation: orb-float 5s ease-in-out infinite alternate;
}
.sp-orb-1 { width:500px;height:500px;top:-15%;right:-8%;background:radial-gradient(circle,rgba(42,106,232,0.28),transparent 70%); }
.sp-orb-2 { width:400px;height:400px;bottom:-12%;left:-8%;background:radial-gradient(circle,rgba(232,87,42,0.22),transparent 70%);animation-delay:-2.5s; }
.sp-orb-3 { width:300px;height:300px;top:30%;left:20%;background:radial-gradient(circle,rgba(201,168,76,0.15),transparent 70%);animation-delay:-1s; }
@keyframes orb-float { from{transform:translate(0,0) scale(1)} to{transform:translate(25px,-25px) scale(1.1)} }

/* Phase 1 */
#phase1 {
  position:absolute; display:flex; flex-direction:column; align-items:center; gap:18px; z-index:2;
  transition: opacity 0.52s ease, transform 0.52s ease;
}
#phase1.out { opacity:0; transform:scale(0.93); pointer-events:none; }

.p1-logo { display:flex; align-items:center; gap:14px; }
.p1-dot {
  display:block; width:13px; height:13px; border-radius:50%; background:#e8572a;
  box-shadow:0 0 24px rgba(232,87,42,0.7); flex-shrink:0;
  animation: dot-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes dot-pop { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }

.p1-word { display:flex; align-items:baseline; }
.p1-letter {
  font-family:'Syne',sans-serif; font-weight:800;
  font-size:clamp(3rem,9vw,6rem); color:#f7f6f2;
  letter-spacing:-0.03em; line-height:1; display:inline-block;
  opacity:0; transform:translateY(36px) rotate(5deg);
  animation: letter-rise 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
.p1-letter.gold { color:#c9a84c; }
@keyframes letter-rise { to{opacity:1;transform:translateY(0) rotate(0deg)} }

.p1-tagline {
  font-family:'DM Sans',sans-serif; font-weight:300; font-size:0.78rem;
  letter-spacing:0.22em; text-transform:uppercase; color:rgba(247,246,242,0.3); margin:0;
  opacity:0; animation: fade-up 0.5s ease 0.75s forwards;
}
.p1-bar-wrap {
  width:160px; height:2px; background:rgba(247,246,242,0.08);
  border-radius:2px; overflow:hidden; opacity:0;
  animation: fade-up 0.4s ease 0.9s forwards;
}
.p1-bar {
  height:100%; width:0%;
  background:linear-gradient(90deg,#2a6ae8,#e8572a);
  animation: bar-fill 1.2s cubic-bezier(0.4,0,0.2,1) 1s forwards;
}
@keyframes bar-fill { to{width:100%} }
@keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

/* Phase 2 */
#phase2 {
  position:absolute; display:flex; flex-direction:column; align-items:center; gap:20px; z-index:2;
  opacity:0; pointer-events:none;
  transition: opacity 0.5s ease, transform 0.5s ease;
}
#phase2.in  { opacity:1; pointer-events:auto; }
#phase2.out { opacity:0; transform:translateY(-28px); }

.p2-line1 { display:flex; align-items:baseline; gap:0.28em; flex-wrap:wrap; justify-content:center; }
.p2-word {
  font-family:'Syne',sans-serif; font-weight:800;
  font-size:clamp(2.2rem,6vw,4.8rem); letter-spacing:-0.03em; line-height:1.05;
  display:inline-block;
  opacity:0; filter:blur(14px); transform:scale(1.18);
  transition: opacity 0.55s ease, filter 0.55s ease, transform 0.55s ease;
}
.p2-word.show { opacity:1; filter:blur(0); transform:scale(1); }
.p2-word.w-connect { color:#f7f6f2; }
.p2-word.w-comma   { color:rgba(247,246,242,0.25); font-size:clamp(1.8rem,5vw,4rem); }
.p2-word.w-learn   { color:#2a6ae8; }
.p2-word.w-and     { color:rgba(247,246,242,0.4); font-size:clamp(1rem,2.5vw,2rem); font-weight:300; font-style:italic; font-family:'DM Sans',sans-serif; letter-spacing:0; }
.p2-word.w-prosper { color:#c9a84c; }

.p2-underline {
  width:0; height:3px; border-radius:2px;
  background:linear-gradient(90deg,#2a6ae8 0%,#c9a84c 50%,#e8572a 100%);
  transition:width 0.8s cubic-bezier(0.4,0,0.2,1);
  align-self:flex-start; margin-left:4px;
}
.p2-underline.draw { width:100%; }

.p2-line2 { overflow:hidden; }
.p2-subline {
  font-family:'DM Sans',sans-serif; font-weight:300; font-size:clamp(0.9rem,2.2vw,1.4rem);
  letter-spacing:0.2em; text-transform:uppercase; color:rgba(247,246,242,0.45);
  display:flex; align-items:center; gap:14px;
  transform:translateY(110%);
  transition:transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
.p2-subline.show { transform:translateY(0); }
.p2-subline::before, .p2-subline::after { content:''; display:block; width:36px; height:1px; background:rgba(247,246,242,0.2); }

/* ═══════════════════════════════════════
   MAIN SITE STYLES
═══════════════════════════════════════ */
#site {
  display: none; /* hidden until splash done */
  min-height: 100vh;
  background: #f7f6f2;
  font-family: 'DM Sans', sans-serif;
  overflow-y: auto; /* SCROLLABLE */
}
#site.visible { display: block; }

:root {
  --ink:#0a0a0f; --paper:#f7f6f2; --cream:#edeae0;
  --accent:#e8572a; --accent2:#2a6ae8; --gold:#c9a84c;
  --muted:#8a8880; --border:rgba(10,10,15,0.08);
}

/* NAV */
nav.db-nav {
  background:var(--ink); padding:0 2.5rem; height:64px;
  display:flex; align-items:center; justify-content:space-between;
  position:sticky; top:0; z-index:100;
}
.db-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.3rem; color:var(--paper); letter-spacing:-0.02em; display:flex; align-items:center; gap:10px; }
.db-logo-dot { width:8px;height:8px;background:var(--accent);border-radius:50%;animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
.db-nav-right { display:flex;align-items:center;gap:8px; }
.db-nav-greeting { font-size:.8rem;color:rgba(247,246,242,0.45);font-style:italic;margin-right:8px; }
.db-nav-greeting span { color:var(--gold);font-style:normal;font-weight:500; }
.db-btn-ghost { background:transparent;border:1px solid rgba(247,246,242,0.15);color:rgba(247,246,242,0.7);padding:6px 16px;border-radius:100px;font-size:.8rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s; }
.db-btn-ghost:hover { background:rgba(247,246,242,0.1);color:var(--paper); }
.db-btn-danger { background:transparent;border:1px solid rgba(232,87,42,0.3);color:var(--accent);padding:6px 16px;border-radius:100px;font-size:.8rem;cursor:pointer;font-family:'DM Sans',sans-serif; }

/* MAIN CONTENT */
.db-main { max-width:1280px;margin:0 auto;padding:3rem 2.5rem 5rem; }

/* HERO */
.db-hero { margin-bottom:4rem;position:relative;padding:3.5rem 3rem;background:var(--ink);border-radius:24px;overflow:hidden; }
.db-hero-bg { position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(42,106,232,0.25) 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 20% 80%,rgba(232,87,42,0.2) 0%,transparent 50%); }
.db-hero-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(247,246,242,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(247,246,242,0.04) 1px,transparent 1px);background-size:40px 40px; }
.db-hero-content { position:relative;z-index:1; }
.db-eyebrow { font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:1rem;display:flex;align-items:center;gap:8px; }
.db-eyebrow::before { content:'';width:24px;height:1px;background:var(--accent); }
.db-hero h1 { font-family:'Syne',sans-serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:800;color:var(--paper);line-height:1.1;margin:0 0 1rem;letter-spacing:-0.03em; }
.db-hero h1 em { font-style:normal;color:var(--gold); }
.db-hero p { color:rgba(247,246,242,0.5);font-size:1rem;max-width:460px;line-height:1.6;font-weight:300; }

/* SEARCH */
.db-search-wrap { margin-bottom:3.5rem;position:relative;max-width:560px; }
.db-search-wrap input { width:100%;padding:1rem 1.2rem 1rem 3.2rem;border:1.5px solid var(--border);border-radius:14px;background:#fff;font-family:'DM Sans',sans-serif;font-size:.95rem;color:var(--ink);outline:none;box-shadow:0 2px 12px rgba(10,10,15,0.04);transition:all .2s; }
.db-search-wrap input:focus { border-color:var(--accent2);box-shadow:0 0 0 4px rgba(42,106,232,0.08); }
.db-search-icon { position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:var(--muted);width:18px;height:18px; }

/* SECTION HEADER */
.db-section-header { display:flex;align-items:baseline;gap:12px;margin-bottom:1.5rem; }
.db-section-title { font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:700;color:var(--ink);letter-spacing:-0.02em; }
.db-section-count { font-size:.78rem;background:var(--cream);color:var(--muted);padding:2px 10px;border-radius:100px;font-weight:500; }

/* CHAT CARDS */
.db-chat-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-bottom:4rem; }
.db-chat-card { background:#fff;border:1.5px solid var(--border);border-radius:18px;padding:1.4rem;transition:all .25s;cursor:pointer; }
.db-chat-card:hover { border-color:var(--accent2);box-shadow:0 8px 32px rgba(42,106,232,0.1);transform:translateY(-2px); }
.db-chat-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.8rem; }
.db-chat-name { font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:var(--ink); }
.db-badge { font-size:.68rem;padding:3px 10px;border-radius:100px;font-weight:600;letter-spacing:.02em; }
.db-badge-senior { background:#ede8f7;color:#6b3fbb; }
.db-badge-junior { background:#e8f5ee;color:#1e7a42; }
.db-chat-email { font-size:.8rem;color:var(--muted);margin-bottom:1.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.db-chat-btn { width:100%;background:var(--ink);color:var(--paper);border:none;padding:.65rem 1rem;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s; }
.db-chat-btn:hover { background:var(--accent2); }
.db-empty-state { background:#fff;border:1.5px dashed var(--border);border-radius:18px;padding:2.5rem;text-align:center;color:var(--muted);font-size:.9rem;font-style:italic; }

/* MENTOR CARDS */
.db-mentor-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem; }
.db-mentor-card { background:#fff;border:1.5px solid var(--border);border-radius:22px;overflow:hidden;transition:all .3s;display:flex;flex-direction:column; }
.db-mentor-card:hover { box-shadow:0 20px 60px rgba(10,10,15,0.1);transform:translateY(-4px);border-color:transparent; }
.db-card-top { height:80px; }
.db-card-body { padding:0 1.6rem 1.6rem;flex:1;display:flex;flex-direction:column;margin-top:-28px; }
.db-avatar { width:56px;height:56px;border-radius:16px;border:3px solid white;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;color:white;margin-bottom:.8rem;position:relative;z-index:1;box-shadow:0 4px 16px rgba(0,0,0,0.15);transition:transform .25s; }
.db-mentor-card:hover .db-avatar { transform:scale(1.08); }
.db-mentor-name { font-family:'Syne',sans-serif;font-weight:700;font-size:1.05rem;color:var(--ink);margin-bottom:2px; }
.db-mentor-role { font-size:.78rem;color:var(--muted);margin-bottom:1rem; }
.db-skills-label { font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:.5rem; }
.db-skills { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:1.2rem;flex:1; }
.db-skill-tag { font-size:.72rem;padding:4px 10px;background:var(--cream);color:var(--ink);border-radius:8px;font-weight:500;transition:all .15s;cursor:default; }
.db-skill-tag:hover { background:var(--ink);color:var(--paper); }
.db-card-footer { margin-top:auto;padding-top:1rem;border-top:1px solid var(--border); }
.db-btn-connect { width:100%;background:transparent;border:1.5px solid var(--ink);color:var(--ink);padding:.7rem 1rem;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s; }
.db-btn-connect:hover { background:var(--ink);color:var(--paper); }
.db-btn-pending { width:100%;background:var(--cream);border:1.5px solid var(--border);color:var(--muted);padding:.7rem 1rem;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.85rem;cursor:not-allowed;display:flex;align-items:center;justify-content:center;gap:8px; }
.db-accepted-box { background:linear-gradient(135deg,#e8f5ee,#f0faf4);border:1.5px solid #b8dfc8;border-radius:12px;padding:1rem; }
.db-accepted-label { font-size:.78rem;font-weight:700;color:#1e7a42;margin-bottom:.4rem; }
.db-accepted-info { font-size:.75rem;color:#2d6645;margin-bottom:3px; }
.db-btn-open-chat { width:100%;margin-top:.7rem;background:var(--ink);color:var(--paper);border:none;padding:.6rem 1rem;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .2s; }
.db-btn-open-chat:hover { background:var(--accent2); }

/* PALETTES */
.pal-0{background:linear-gradient(135deg,#0a0a0f,#1a1a2e)}
.pal-1{background:linear-gradient(135deg,#1e3a5f,#2a6ae8)}
.pal-2{background:linear-gradient(135deg,#5f1e1e,#e8572a)}
.pal-3{background:linear-gradient(135deg,#1e5f3a,#2ae878)}
.pal-4{background:linear-gradient(135deg,#3a1e5f,#8a2ae8)}
.pal-5{background:linear-gradient(135deg,#5f4a1e,#c9a84c)}

/* MODAL */
.db-modal-overlay { position:fixed;inset:0;background:rgba(10,10,15,0.75);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;z-index:200;padding:1.5rem; }
.db-modal-overlay.open { display:flex; }
.db-modal { background:var(--paper);border-radius:24px;width:100%;max-width:500px;overflow:hidden;box-shadow:0 40px 100px rgba(10,10,15,0.35); }
.db-modal-head { background:var(--ink);padding:1.8rem 2rem;display:flex;justify-content:space-between;align-items:flex-start; }
.db-modal-title { font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--paper);letter-spacing:-0.02em; }
.db-modal-sub { font-size:.8rem;color:rgba(247,246,242,0.45);margin-top:3px; }
.db-modal-close { background:rgba(247,246,242,0.1);border:none;color:var(--paper);width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem;line-height:1;flex-shrink:0;transition:background .2s; }
.db-modal-close:hover { background:rgba(247,246,242,0.2); }
.db-modal-body { padding:2rem; }
.db-modal-label { font-size:.82rem;font-weight:600;color:var(--ink);margin-bottom:.6rem;display:block; }
.db-modal-textarea { width:100%;padding:1rem;border:1.5px solid var(--border);border-radius:14px;background:white;font-family:'DM Sans',sans-serif;font-size:.9rem;color:var(--ink);resize:none;outline:none;transition:border-color .2s;margin-bottom:1.5rem;line-height:1.6; }
.db-modal-textarea:focus { border-color:var(--accent2);box-shadow:0 0 0 4px rgba(42,106,232,0.08); }
.db-modal-actions { display:flex;justify-content:flex-end;gap:10px; }
.db-btn-cancel { background:transparent;border:1.5px solid var(--border);color:var(--muted);padding:.65rem 1.4rem;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.85rem;cursor:pointer;transition:all .2s; }
.db-btn-cancel:hover { background:var(--cream);color:var(--ink); }
.db-btn-submit { background:var(--ink);border:none;color:var(--paper);padding:.65rem 1.6rem;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .2s; }
.db-btn-submit:hover { background:var(--accent2); }

/* REPLAY BTN */
#replayBtn { position:fixed;bottom:24px;right:24px;z-index:99999;background:var(--ink);color:var(--paper);border:none;padding:10px 20px;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.35);transition:background .2s; }
#replayBtn:hover { background:var(--accent2); }
</style>
</head>
<body>

<!-- CURTAIN -->
<div id="curtain"></div>

<!-- SPLASH -->
<div id="splash">
  <div class="sp-grid"></div>
  <div class="sp-orb sp-orb-1"></div>
  <div class="sp-orb sp-orb-2"></div>
  <div class="sp-orb sp-orb-3"></div>

  <!-- Phase 1 -->
  <div id="phase1">
    <div class="p1-logo">
      <span class="p1-dot"></span>
      <div class="p1-word" id="p1word"></div>
    </div>
    <p class="p1-tagline">Mentorship Platform</p>
    <div class="p1-bar-wrap"><div class="p1-bar" id="p1bar"></div></div>
  </div>

  <!-- Phase 2 -->
  <div id="phase2">
    <div class="p2-line1">
      <span class="p2-word w-connect">Connect</span>
      <span class="p2-word w-comma">,</span>
      <span class="p2-word w-learn">Learn</span>
      <span class="p2-word w-and">and</span>
      <span class="p2-word w-prosper">Prosper</span>
    </div>
    <div class="p2-underline" id="p2underline"></div>
    <div class="p2-line2">
      <div class="p2-subline" id="p2subline">With the Seniors</div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     MAIN SITE — Full Dashboard
═══════════════════════════════════════ -->
<div id="site">

  <!-- NAV -->
  <nav class="db-nav">
    <div class="db-logo"><div class="db-logo-dot"></div>SkillBridge</div>
    <div class="db-nav-right">
      <span class="db-nav-greeting">Hello, <span>Alex</span></span>
      <button class="db-btn-ghost">Profile</button>
      <button class="db-btn-danger">Log Out</button>
    </div>
  </nav>

  <div class="db-main">

    <!-- HERO -->
    <div class="db-hero">
      <div class="db-hero-bg"></div>
      <div class="db-hero-grid"></div>
      <div class="db-hero-content">
        <div class="db-eyebrow">Mentorship Platform</div>
        <h1>Find Your<br /><em>Perfect Mentor</em></h1>
        <p>Connect with experienced seniors, level up your skills, and accelerate your career journey.</p>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="db-search-wrap">
      <svg class="db-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" placeholder="Search by skills or name…" id="searchInput" oninput="filterCards()"/>
    </div>

    <!-- ACTIVE CHATS -->
    <div style="margin-bottom:3.5rem">
      <div class="db-section-header">
        <span class="db-section-title">Active Chats</span>
        <span class="db-section-count">2</span>
      </div>
      <div class="db-chat-grid">
        <div class="db-chat-card">
          <div class="db-chat-top">
            <span class="db-chat-name">Sarah Johnson</span>
            <span class="db-badge db-badge-senior">Senior / Mentor</span>
          </div>
          <div class="db-chat-email">sarah.johnson@example.com</div>
          <button class="db-chat-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Open Chat
          </button>
        </div>
        <div class="db-chat-card">
          <div class="db-chat-top">
            <span class="db-chat-name">Marcus Williams</span>
            <span class="db-badge db-badge-junior">Junior / Mentee</span>
          </div>
          <div class="db-chat-email">marcus.w@example.com</div>
          <button class="db-chat-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Open Chat
          </button>
        </div>
      </div>
    </div>

    <!-- BROWSE MENTORS -->
    <div>
      <div class="db-section-header">
        <span class="db-section-title">Browse Mentors</span>
        <span class="db-section-count" id="mentorCount">6 found</span>
      </div>
      <div class="db-mentor-grid" id="mentorGrid">

        <div class="db-mentor-card" data-name="Priya Sharma" data-skills="React,TypeScript,Node.js,System Design">
          <div class="db-card-top pal-1"></div>
          <div class="db-card-body">
            <div class="db-avatar pal-1">P</div>
            <div class="db-mentor-name">Priya Sharma</div>
            <div class="db-mentor-role">Senior Developer · 4th Year</div>
            <div class="db-skills-label">Top Skills</div>
            <div class="db-skills"><span class="db-skill-tag">React</span><span class="db-skill-tag">TypeScript</span><span class="db-skill-tag">Node.js</span><span class="db-skill-tag">System Design</span></div>
            <div class="db-card-footer">
              <div class="db-accepted-box">
                <div class="db-accepted-label">✓ Connected</div>
                <div class="db-accepted-info"><strong>Email:</strong> priya.s@example.com</div>
                <div class="db-accepted-info"><strong>Mobile:</strong> +91 98765 43210</div>
                <button class="db-btn-open-chat">Open Chat</button>
              </div>
            </div>
          </div>
        </div>

        <div class="db-mentor-card" data-name="Arjun Mehta" data-skills="Python,Machine Learning,TensorFlow,Data Science">
          <div class="db-card-top pal-0"></div>
          <div class="db-card-body">
            <div class="db-avatar pal-0">A</div>
            <div class="db-mentor-name">Arjun Mehta</div>
            <div class="db-mentor-role">Senior Developer · 4th Year</div>
            <div class="db-skills-label">Top Skills</div>
            <div class="db-skills"><span class="db-skill-tag">Python</span><span class="db-skill-tag">Machine Learning</span><span class="db-skill-tag">TensorFlow</span></div>
            <div class="db-card-footer">
              <button class="db-btn-pending" disabled>⟳ Requested</button>
            </div>
          </div>
        </div>

        <div class="db-mentor-card" data-name="Neha Gupta" data-skills="UI/UX,Figma,CSS,Design Systems">
          <div class="db-card-top pal-4"></div>
          <div class="db-card-body">
            <div class="db-avatar pal-4">N</div>
            <div class="db-mentor-name">Neha Gupta</div>
            <div class="db-mentor-role">Senior Developer · 3rd Year</div>
            <div class="db-skills-label">Top Skills</div>
            <div class="db-skills"><span class="db-skill-tag">UI/UX</span><span class="db-skill-tag">Figma</span><span class="db-skill-tag">CSS</span><span class="db-skill-tag">Design Systems</span></div>
            <div class="db-card-footer">
              <button class="db-btn-connect" onclick="openModal('Neha Gupta')">Connect →</button>
            </div>
          </div>
        </div>

        <div class="db-mentor-card" data-name="Rohan Das" data-skills="Go,Kubernetes,Docker,Cloud Architecture">
          <div class="db-card-top pal-3"></div>
          <div class="db-card-body">
            <div class="db-avatar pal-3">R</div>
            <div class="db-mentor-name">Rohan Das</div>
            <div class="db-mentor-role">Senior Developer · 4th Year</div>
            <div class="db-skills-label">Top Skills</div>
            <div class="db-skills"><span class="db-skill-tag">Go</span><span class="db-skill-tag">Kubernetes</span><span class="db-skill-tag">Docker</span><span class="db-skill-tag">Cloud</span></div>
            <div class="db-card-footer">
              <button class="db-btn-connect" onclick="openModal('Rohan Das')">Connect →</button>
            </div>
          </div>
        </div>

        <div class="db-mentor-card" data-name="Kavya Nair" data-skills="Java,Spring Boot,Microservices,AWS">
          <div class="db-card-top pal-2"></div>
          <div class="db-card-body">
            <div class="db-avatar pal-2">K</div>
            <div class="db-mentor-name">Kavya Nair</div>
            <div class="db-mentor-role">Senior Developer · 3rd Year</div>
            <div class="db-skills-label">Top Skills</div>
            <div class="db-skills"><span class="db-skill-tag">Java</span><span class="db-skill-tag">Spring Boot</span><span class="db-skill-tag">AWS</span></div>
            <div class="db-card-footer">
              <button class="db-btn-connect" onclick="openModal('Kavya Nair')">Connect →</button>
            </div>
          </div>
        </div>

        <div class="db-mentor-card" data-name="Vikram Singh" data-skills="iOS,Swift,SwiftUI,App Architecture">
          <div class="db-card-top pal-5"></div>
          <div class="db-card-body">
            <div class="db-avatar pal-5">V</div>
            <div class="db-mentor-name">Vikram Singh</div>
            <div class="db-mentor-role">Senior Developer · 4th Year</div>
            <div class="db-skills-label">Top Skills</div>
            <div class="db-skills"><span class="db-skill-tag">iOS</span><span class="db-skill-tag">Swift</span><span class="db-skill-tag">SwiftUI</span></div>
            <div class="db-card-footer">
              <button class="db-btn-connect" onclick="openModal('Vikram Singh')">Connect →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div><!-- /db-main -->

  <!-- MODAL -->
  <div class="db-modal-overlay" id="modal">
    <div class="db-modal">
      <div class="db-modal-head">
        <div>
          <div class="db-modal-title">Send Request</div>
          <div class="db-modal-sub" id="modalSub">To: —</div>
        </div>
        <button class="db-modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="db-modal-body">
        <label class="db-modal-label">Why do you want to connect?</label>
        <textarea rows="4" class="db-modal-textarea" placeholder="Hi! I'm looking for guidance on React…"></textarea>
        <div class="db-modal-actions">
          <button class="db-btn-cancel" onclick="closeModal()">Cancel</button>
          <button class="db-btn-submit" onclick="closeModal()">Send Request →</button>
        </div>
      </div>
    </div>
  </div>

</div><!-- /site -->

<!-- REPLAY -->
<button id="replayBtn" onclick="runSequence()">↺ Replay Splash</button>

<script>
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function buildLetters() {
    const letters = ['S','k','i','l','l','B','r','i','d','g','e'];
    const word = document.getElementById('p1word');
    word.innerHTML = '';
    letters.forEach((l, i) => {
      const s = document.createElement('span');
      s.className = 'p1-letter' + (i === 5 ? ' gold' : '');
      s.textContent = l;
      s.style.animationDelay = `${i * 55}ms`;
      word.appendChild(s);
    });
  }

  function resetBar() {
    const wrap = document.querySelector('.p1-bar-wrap');
    const old  = document.getElementById('p1bar');
    const n    = old.cloneNode(true);
    n.id = 'p1bar';
    wrap.replaceChild(n, old);
  }

  function resetP2() {
    document.querySelectorAll('.p2-word').forEach(w => w.classList.remove('show'));
    document.getElementById('p2underline').classList.remove('draw');
    document.getElementById('p2subline').classList.remove('show');
  }

  async function runSequence() {
    const curtain = document.getElementById('curtain');
    const splash  = document.getElementById('splash');
    const site    = document.getElementById('site');
    const p1      = document.getElementById('phase1');
    const p2      = document.getElementById('phase2');

    // RESET
    curtain.className = '';
    splash.style.display = 'flex';
    site.classList.remove('visible');
    site.style.display = 'none';
    p1.classList.remove('out');
    p2.classList.remove('in','out');
    resetP2();
    buildLetters();
    resetBar();
    await wait(50);

    // ── PHASE 1
    await wait(2400);

    // ── TRANSITION 1 → 2
    p1.classList.add('out');
    await wait(520);
    p2.classList.add('in');

    const wordDelays = [0,80,200,420,560];
    document.querySelectorAll('.p2-word').forEach((w,i) => {
      setTimeout(() => w.classList.add('show'), wordDelays[i]);
    });
    await wait(820);
    document.getElementById('p2underline').classList.add('draw');
    await wait(420);
    document.getElementById('p2subline').classList.add('show');
    await wait(1800);

    // ── TRANSITION 2 → SITE
    p2.classList.remove('in');
    p2.classList.add('out');
    await wait(250);

    curtain.classList.add('rise');
    await wait(560);

    // Show site while curtain covers
    splash.style.display = 'none';
    site.style.display = 'block';
    site.classList.add('visible');
    await wait(80);

    // Curtain falls away
    curtain.classList.remove('rise');
    curtain.classList.add('fall');
    await wait(560);
    curtain.className = '';
  }

  // Modal
  function openModal(name) {
    document.getElementById('modalSub').textContent = 'To: ' + name;
    document.getElementById('modal').classList.add('open');
  }
  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Search filter
  function filterCards() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.db-mentor-card');
    let count = 0;
    cards.forEach(card => {
      const match = !q || card.dataset.name.toLowerCase().includes(q) || card.dataset.skills.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) count++;
    });
    document.getElementById('mentorCount').textContent = count + ' found';
  }

  // Auto-run on load
  runSequence();
</script>
</body>
</html>
    
