"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function Home() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .aq-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Syne', sans-serif;
          transition: background 0.4s ease, color 0.4s ease;
        }

        .aq-root.dark-env { background: #03030d; color: #ffffff; }
        .aq-root.light-env { background: #f6f8fc; color: #0f172a; }

        .aq-vignette { position: absolute; inset: 0; pointer-events: none; transition: background 0.4s ease; }
        .dark-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,180,220,0.07) 0%, rgba(80,40,200,0.05) 40%, transparent 70%); }
        .light-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,180,220,0.04) 0%, rgba(148,88,255,0.03) 40%, transparent 70%); }

        .aq-grid { position: absolute; inset: 0; pointer-events: none; }
        .dark-env .aq-grid { background-image: linear-gradient(rgba(0,212,255,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.032) 1px, transparent 1px); background-size: 60px 60px; }
        .light-env .aq-grid { background-image: linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px); background-size: 60px 60px; }

        .aq-orb { position: absolute; border-radius: 50%; pointer-events: none; animation: orbDrift ease-in-out infinite alternate; transition: all 0.5s ease; }
        @keyframes orbDrift { from{transform:translate(0,0) scale(1);} to{transform:translate(25px,18px) scale(1.07);} }

        .aq-scan { position: absolute; left: 0; right: 0; height: 2px; animation: scanLine 9s linear infinite; pointer-events: none; }
        .dark-env .aq-scan { background: linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.12) 40%, rgba(0,212,255,0.22) 50%, rgba(0,212,255,0.12) 60%, transparent 100%); }
        .light-env .aq-scan { background: linear-gradient(90deg, transparent 0%, rgba(148,88,255,0.08) 40%, rgba(0,212,255,0.15) 50%, rgba(148,88,255,0.08) 60%, transparent 100%); }
        @keyframes scanLine { 0%{top:-2px;opacity:0;} 5%{opacity:1;} 95%{opacity:0.5;} 100%{top:100%;opacity:0;} }

        .aq-particle { position: absolute; border-radius: 50%; pointer-events: none; animation: particleRise linear infinite; }
        @keyframes particleRise { 0%{transform:translateY(0);opacity:0;} 8%{opacity:1;} 92%{opacity:0.5;} 100%{transform:translateY(-100vh);opacity:0;} }

        .aq-wrap { position: relative; z-index: 10; width: 100%; max-width: 1060px; padding: 4rem 2.5rem; display: grid; grid-template-columns: 1.1fr 1fr; gap: 4rem; align-items: center; min-height: 100vh; }

        .theme-toggle-panel { position: absolute; top: 2.5rem; right: 2.5rem; z-index: 50; }
        .toggle-btn { font-family: 'Space Mono', monospace; font-size: 0.62rem; letter-spacing: 0.15em; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s ease; }
        .dark-env .toggle-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(0,212,255,0.3); color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.1); }
        .light-env .toggle-btn { background: #ffffff; border: 1px solid rgba(15,23,42,0.15); color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .aq-hero { display: flex; flex-direction: column; }
        .aq-atom-stage { position: relative; width: 120px; height: 120px; margin-bottom: 2.25rem; }
        .aq-ring { position: absolute; top: 50%; left: 50%; border-radius: 50%; transform: translate(-50%,-50%); animation: ringPulse 4s ease-in-out infinite; }
        .dark-env .aq-ring { border: 1px solid rgba(0,212,255,0.12); }
        .light-env .aq-ring { border: 1px solid rgba(148,88,255,0.18); }
        @keyframes ringPulse { 0%,100%{opacity:0.35;transform:translate(-50%,-50%) scale(1);} 50%{opacity:0.75;transform:translate(-50%,-50%) scale(1.04);} }
        
        .aq-core { position: absolute; top: 50%; left: 50%; width: 76px; height: 76px; transform: translate(-50%,-50%); border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .dark-env .aq-core { background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(120,60,255,0.1)); border: 1px solid rgba(0,212,255,0.26); }
        .light-env .aq-core { background: #ffffff; border: 1px solid rgba(148,88,255,0.25); box-shadow: 0 8px 24px rgba(148,88,255,0.1); }

        .aq-el1 { animation: spin1 7s linear infinite; transform-origin: 18px 18px; }
        .aq-el2 { animation: spin1 9s linear infinite reverse; transform-origin: 18px 18px; }
        @keyframes spin1 { from{stroke-dashoffset:0;} to{stroke-dashoffset:-200;} }

        .aq-eyebrow { font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:0.8rem; display:flex; align-items:center; gap:10px; }
        .dark-env .aq-eyebrow { color:rgba(0,212,255,0.6); }
        .light-env .aq-eyebrow { color:#743bfb; }
        .aq-eyebrow::before { content:''; width:28px; height:1px; display:block; }
        .dark-env .aq-eyebrow::before { background:rgba(0,212,255,0.35); }
        .light-env .aq-eyebrow::before { background:rgba(116,59,251,0.35); }

        .aq-h1 { font-size: clamp(3.2rem, 5.5vw, 4.5rem); font-weight: 800; letter-spacing: -0.04em; line-height: 0.92; margin: 0 0 1.6rem; }
        .dark-env .aq-h1 { background: linear-gradient(150deg, #ffffff 0%, #c0eeff 45%, #b0a0ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .light-env .aq-h1 { background: linear-gradient(150deg, #0f172a 0%, #1e293b 60%, #475569 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .aq-tagline { font-family:'Space Mono',monospace; font-size:0.7rem; line-height:1.9; margin-bottom:2.75rem; letter-spacing:0.02em; }
        .dark-env .aq-tagline { color:rgba(255,255,255,0.35); }
        .light-env .aq-tagline { color:#475569; }

        .aq-stats { display:flex; gap:0; }
        .aq-stat { display:flex; flex-direction:column; gap:0.25rem; padding: 0 1.5rem 0 0; }
        .aq-stat:first-child { padding-left: 0; }
        .aq-stat-n { font-size:1.6rem; font-weight:800; letter-spacing:-0.04em; }
        .dark-env .aq-stat-n { background:linear-gradient(135deg,#00d4ff,#7050ff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .light-env .aq-stat-n { background:linear-gradient(135deg,#4f46e5,#743bfb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .aq-stat-l { font-family:'Space Mono',monospace; font-size:0.55rem; letter-spacing:0.12em; text-transform:uppercase; }
        .dark-env .aq-stat-l { color:rgba(255,255,255,0.2); }
        .light-env .aq-stat-l { color:#64748b; }
        .aq-sdiv { width:1px; height:38px; align-self:center; margin-right:1.5rem; }
        .dark-env .aq-sdiv { background:rgba(255,255,255,0.07); }
        .light-env .aq-sdiv { background:rgba(15,23,42,0.08); }

        .aq-right { display:flex; flex-direction:column; gap:0.65rem; }
        .aq-rlabel { font-family:'Space Mono',monospace; font-size:0.57rem; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:0.15rem; padding-left:2px; }
        .dark-env .aq-rlabel { color:rgba(255,255,255,0.2); }
        .light-env .aq-rlabel { color:#475569; }

        .aq-card { display:flex; align-items:center; gap:1.1rem; padding:1.2rem 1.4rem; border-radius:14px; border:1px solid; text-decoration:none; position:relative; overflow:hidden; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease, background 0.3s ease; }
        .dark-env .aq-card { background:rgba(255,255,255,0.018); border-color:rgba(255,255,255,0.06); }
        .light-env .aq-card { background:#ffffff; border-color:rgba(15,23,42,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .aq-card:hover { transform:translateX(5px); }

        .cc { border-color:rgba(0,212,255,0.12); }
        .dark-env .cc:hover { border-color:rgba(0,212,255,0.42); box-shadow:0 0 32px rgba(0,212,255,0.1); }
        .light-env .cc:hover { border-color:rgba(0,212,255,0.8); box-shadow:0 10px 25px rgba(0,212,255,0.08); }
        .ca { border-color:rgba(255,160,0,0.12); }
        .dark-env .ca:hover { border-color:rgba(255,160,0,0.42); box-shadow:0 0 32px rgba(255,160,0,0.1); }
        .light-env .ca:hover { border-color:rgba(255,160,0,0.8); box-shadow:0 10px 25px rgba(255,160,0,0.08); }
        .cv { border-color:rgba(148,88,255,0.12); }
        .dark-env .cv:hover { border-color:rgba(148,88,255,0.42); box-shadow:0 0 32px rgba(148,88,255,0.1); }
        .light-env .cv:hover { border-color:rgba(148,88,255,0.8); box-shadow:0 10px 25px rgba(148,88,255,0.08); }

        .aq-ic { width:44px; height:44px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; z-index:1; }
        .ic { background:rgba(0,212,255,0.08); }
        .ia { background:rgba(255,160,0,0.08); }
        .iv { background:rgba(148,88,255,0.08); }

        .aq-cb { flex:1; position:relative; z-index:1; }
        .aq-ct { font-size:1.05rem; font-weight:700; letter-spacing:-0.01em; margin:0 0 0.2rem; }
        .dark-env .aq-ct { color:#fff; }
        .light-env .aq-ct { color:#0f172a; }

        .aq-cs { font-family:'Space Mono',monospace; font-size:0.62rem; letter-spacing:0.04em; margin:0; }
        .sc { color:rgba(0,212,255,0.5); }
        .light-env .sc { color:#0284c7; }
        .sa { color:rgba(255,160,0,0.5); }
        .light-env .sa { color:#b45309; }
        .sv { color:rgba(148,88,255,0.5); }
        .light-env .sv { color:#6d28d9; }

        .aq-badge { font-family:'Space Mono',monospace; font-size:0.5rem; padding:3px 9px; border-radius:5px; letter-spacing:0.12em; text-transform:uppercase; position:relative; z-index:1; flex-shrink:0; }
        .bc { background:rgba(0,212,255,0.07); color:rgba(0,212,255,0.6); border:1px solid rgba(0,212,255,0.14); }
        .ba { background:rgba(255,160,0,0.07); color:rgba(255,160,0,0.6); border:1px solid rgba(255,160,0,0.14); }
        .bv { background:rgba(148,88,255,0.07); color:rgba(148,88,255,0.6); border:1px solid rgba(148,88,255,0.14); }

        .social-link-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-top: 0.2rem; }
        .social-card { display: flex; align-items: center; gap: 0.75rem; padding: 10px 14px; border-radius: 10px; text-decoration: none; font-family: 'Space Mono', monospace; font-size: 0.62rem; font-weight: bold; transition: all 0.25s ease; border: 1px solid transparent; }
        .dark-env .social-card { background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4); }
        .light-env .social-card { background: #ffffff; border-color: rgba(15,23,42,0.06); color: #475569; }
        .social-card:hover { transform: translateY(-1px); }
        .dark-env .social-card.gh:hover { border-color: #ffffff; color: #ffffff; }
        .light-env .social-card.gh:hover { border-color: #0f172a; color: #0f172a; background: #fafafa; }
        .dark-env .social-card.li:hover { border-color: #0077b5; color: #0077b5; }
        .light-env .social-card.li:hover { border-color: #0077b5; color: #0077b5; background: #f0f7fa; }

        .aq-sys { margin-top:0.2rem; padding:0.9rem 1.1rem; border-radius:12px; display:flex; align-items:center; justify-content:space-between; border:1px solid; }
        .dark-env .aq-sys { border-color: rgba(255,255,255,0.045); background:rgba(255,255,255,0.01); }
        .light-env .aq-sys { border-color: rgba(15,23,42,0.06); background:#ffffff; }
        .aq-sys-txt { font-family:'Space Mono',monospace; font-size:0.58rem; letter-spacing:0.1em; }
        .dark-env .aq-sys-txt { color:rgba(255,255,255,0.22); }
        .light-env .aq-sys-txt { color:#475569; }
        .aq-sys-r { font-family:'Space Mono',monospace; font-size:0.58rem; letter-spacing:0.08em; }
        .dark-env .aq-sys-r { color:rgba(255,255,255,0.14); }
        .light-env .aq-sys-r { color:#94a3b8; }

        .aq-bar { position: absolute; bottom:0; left:0; right:0; padding:1.4rem 2.5rem; display:flex; align-items:center; justify-content:space-between; border-top:1px solid; z-index:10; }
        .dark-env .aq-bar { border-color: rgba(255,255,255,0.038); background: #03030d; }
        .light-env .aq-bar { border-color: rgba(15,23,42,0.06); background: #ffffff; }
        .aq-bar-l { font-family:'Space Mono',monospace; font-size:0.57rem; letter-spacing:0.1em; }
        .dark-env .aq-bar-l { color:rgba(255,255,255,0.2); }
        .light-env .aq-bar-l { color:#475569; }
        .dark-env .aq-bar-l span { color:rgba(0,212,255,0.4); font-weight: bold; }
        .light-env .aq-bar-l span { color:#743bfb; font-weight: bold; }
        .aq-bar-r { font-family:'Space Mono',monospace; font-size:0.57rem; letter-spacing:0.08em; display: flex; gap: 15px; }
        .dark-env .aq-bar-r { color:rgba(255,255,255,0.15); }
        .light-env .aq-bar-r { color:#64748b; }
        .aq-bar-r a { color: inherit; text-decoration: none; }

        /* ── Mobile & Tablet Staging Overrides ── */
        @media (max-width: 768px) {
          .aq-wrap {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            padding: 6rem 1.5rem 8rem 1.5rem;
            align-items: start;
          }
          
          .aq-hero {
            align-items: center;
            text-align: center;
          }
          
          .aq-eyebrow {
            justify-content: center;
          }
          
          .aq-eyebrow::before {
            display: none;
          }
          
          .aq-stats {
            justify-content: center;
            width: 100%;
          }
          
          .theme-toggle-panel {
            top: 1.5rem;
            right: 1.5rem;
          }
          
          .aq-bar {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 1.5rem;
          }
          
          .aq-bar-r {
            justify-content: center;
          }
        }
      `}</style>

      <div className={`aq-root ${darkMode ? "dark-env" : "light-env"}`}>
        <div className="aq-vignette" />
        <div className="aq-grid" />
        <div className="aq-scan" />

        <div className="theme-toggle-panel">
          <button className="toggle-btn" onClick={toggleDarkMode}>
            {darkMode ? "[ THEME: CYBER_DARK ]" : "[ THEME: CORE_LIGHT ]"}
          </button>
        </div>

        <div className="aq-wrap">
          {/* LEFT Panel */}
          <div className="aq-hero">
            <div className="aq-atom-stage">
              <div className="aq-ring" style={{ width:120,height:120 }} />
              <div className="aq-core">
                <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                  <ellipse className="aq-el1" cx="18" cy="18" rx="15" ry="5.5" stroke={darkMode ? "rgba(0,212,255,0.65)" : "rgba(116,59,251,0.65)"} strokeWidth="1.1" strokeDasharray="8 4"/>
                  <circle cx="18" cy="18" r="3.5" fill={darkMode ? "rgba(0,212,255,1)" : "#743bfb"}/>
                </svg>
              </div>
            </div>

            <p className="aq-eyebrow">Enterprise Alignment</p>
            <h1 className="aq-h1">Nexus<br/>Tracker</h1>
            <p className="aq-tagline">Map operations. Audit progress. Close the performance feedback loop natively across your structural nodes.</p>

            <div className="aq-stats">
              <div className="aq-stat"><span className="aq-stat-n">3</span><span className="aq-stat-l">Access ports</span></div>
              <div className="aq-sdiv" /><div className="aq-stat"><span className="aq-stat-n">Q2</span><span className="aq-stat-l">Active cycle</span></div>
            </div>
          </div>

          {/* RIGHT Panel */}
          <div className="aq-right">
            <p className="aq-rlabel">Select Authorization Target</p>

            <Link href="/employee" className="aq-card cc">
              <div className="aq-ic ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "rgba(0,212,255,0.85)" : "#0284c7"} strokeWidth="1.7"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="aq-cb"><p className="aq-ct">Employee</p><p className="aq-cs sc">Build strategy · Log metrics</p></div>
              <span className="aq-badge bc">Open</span>
            </Link>

            <Link href="/manager" className="aq-card ca">
              <div className="aq-ic ia">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "rgba(255,160,0,0.85)" : "#b45309"} strokeWidth="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <div className="aq-cb"><p className="aq-ct">Manager</p><p className="aq-cs sa">Inline edits · Authorize lock</p></div>
              <span className="aq-badge ba">Open</span>
            </Link>

            <Link href="/admin" className="aq-card cv">
              <div className="aq-ic iv">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "rgba(148,88,255,0.85)" : "#6d28d9"} strokeWidth="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="aq-cb"><p className="aq-ct">Admin</p><p className="aq-cs sv">Governance metrics · Overrides</p></div>
              <span className="aq-badge bv">Open</span>
            </Link>

            <div className="social-link-panel">
              <a href="https://github.com/GurdarshanSingh78" target="_blank" rel="noreferrer" className="social-card gh">GitHub Profile</a>
              <a href="https://www.linkedin.com/in/gurdarshan-singh-9b11052b3/" target="_blank" rel="noreferrer" className="social-card li">LinkedIn Link</a>
            </div>
          </div>
        </div>

        <div className="aq-bar">
          <p className="aq-bar-l">built by <span>Gurdarshan Singh</span></p>
          <p className="aq-bar-r">
            <a href="https://github.com/GurdarshanSingh78" target="_blank" rel="noreferrer">GitHub</a> · 
            <a href="https://www.linkedin.com/in/gurdarshan-singh-9b11052b3/" target="_blank" rel="noreferrer">LinkedIn</a>
          </p>
        </div>
      </div>
    </>
  );
}