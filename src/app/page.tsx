"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Home() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  const personas = [
    {
      role: "Employee Node",
      title: "Gurdarshan Singh",
      id: "00000000-0000-0000-0000-000000000001",
      email: "developer@mansathi.com",
      description: "Draft goal architecture plans, update quarterly achievements, and track progress scores in real time.",
      route: "/employee",
      color: "from-cyan-500 to-blue-600",
      glow: "rgba(6,182,212,0.15)"
    },
    {
      role: "L1 Management Node",
      title: "Executive Manager L1",
      id: "b26ab711-0000-0000-0000-000000000000",
      email: "manager@nexus.com",
      description: "Review team submittals, make inline target/weightage modifications, and input structured check-in comments.",
      route: "/manager",
      color: "from-purple-500 to-indigo-600",
      glow: "rgba(168,85,247,0.15)"
    },
    {
      role: "Central Administrator",
      title: "HR Compliance Admin",
      id: "c37bc832-0000-0000-0000-000000000000",
      email: "admin@nexus.com",
      description: "Audit post-lock database modifications via the immutable logs, verify metrics, and trigger escalations.",
      route: "/admin",
      color: "from-amber-500 to-orange-600",
      glow: "rgba(245,158,11,0.15)"
    }
  ];

  const handleAccess = (route: string, id: string, roleName: string) => {
    // Save authentication details in browser storage to persist user context across sessions
    localStorage.setItem("nexus_user_id", id);
    localStorage.setItem("nexus_user_role", roleName);
    router.push(route);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
        .gate-root { min-height: 100vh; position: relative; overflow: hidden; font-family: 'Syne', sans-serif; transition: background 0.3s, color 0.3s; }
        .gate-root.dark-env { background: #03030d; color: white; }
        .gate-root.light-env { background: #f6f8fc; color: #0f172a; }
        
        .gate-vignette { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .gate-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.04) 0%, transparent 70%); }
        .light-env .gate-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.01) 0%, transparent 70%); }

        .gate-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .gate-grid { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
        .light-env .gate-grid { background-image: linear-gradient(rgba(15,23,42,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.01) 1px, transparent 1px); background-size: 60px 60px; }

        .mono-text { font-family: 'Space Mono', monospace; }
        .premium-card { backdrop-filter: blur(12px); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .dark-env .premium-card { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); }
        .dark-env .premium-card:hover { background: rgba(255,255,255,0.03); border-color: rgba(0,212,255,0.3); transform: translateY(-6px); }
        
        .light-env .premium-card { background: #ffffff; border: 1px solid rgba(15,23,42,0.06); box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .light-env .premium-card:hover { border-color: rgba(2,132,199,0.3); box-shadow: 0 12px 30px rgba(0,0,0,0.05); transform: translateY(-6px); }
      `}</style>

      <div className={`gate-root ${darkMode ? "dark-env" : "light-env"} flex flex-col justify-between p-6 md:p-12`}>
        <div className="gate-vignette" /><div className="gate-grid" />

        {/* Top Navbar */}
        <div className="relative z-10 flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white tracking-tighter shadow-lg shadow-cyan-500/20">Ω</div>
            <span className="mono-text text-sm font-bold tracking-widest uppercase">Nexus // Tracker</span>
          </div>
          <button className="mono-text text-[11px] font-bold px-4 py-2 rounded-lg border border-gray-500/20 hover:bg-gray-500/10 transition-all shadow-sm" onClick={toggleDarkMode}>
            {darkMode ? "[ LIGHT_CORE ]" : "[ CYBER_DARK ]"}
          </button>
        </div>

        {/* Central Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-12 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="mono-text text-xs font-bold tracking-[0.3em] uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">
              AtomQuest Hackathon 1.0 Submission
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-6 mb-4 bg-gradient-to-b from-inherit to-gray-500/50">
              Identity Access Gate
            </h1>
            <p className="text-sm md:text-base opacity-70 leading-relaxed font-medium">
              Select an operational role context to initialize your workspace journey. The system automatically provisions mock session vectors to isolate data flows.
            </p>
          </div>

          {/* Persona Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto">
            {personas.map((p, idx) => (
              <div 
                key={idx} 
                className="premium-card p-8 rounded-2xl flex flex-col justify-between cursor-pointer group"
                onClick={() => handleAccess(p.route, p.id, p.role)}
                style={{ '--hover-glow': p.glow } as React.CSSProperties}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="mono-text text-[10px] uppercase font-bold tracking-widest text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded">
                      Node_0{idx + 1}
                    </span>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.color} animate-pulse`} />
                  </div>
                  
                  <h3 className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${p.color} bg-clip-text text-transparent mb-1`}>
                    {p.role}
                  </h3>
                  <h2 className="text-xl font-bold tracking-tight mb-4 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                    {p.title}
                  </h2>
                  <p className="text-xs opacity-60 leading-relaxed font-medium mb-6">
                    {p.description}
                  </p>
                </div>

                <div className="border-t border-gray-500/10 pt-4 mt-auto">
                  <div className="mono-text text-[9px] opacity-40 uppercase mb-1">Cryptographic ID Hash</div>
                  <div className="mono-text text-[11px] opacity-70 truncate font-semibold">{p.id}</div>
                  
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 group-hover:gap-2 transition-all">
                    <span>Initialize Workspace</span>
                    <span className="text-xs">➔</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-500/10 pt-6 opacity-50 mono-text text-[10px]">
          <div>Core Architecture: Next.js + Python Serverless Gateway + Supabase PostgreSQL</div>
          <div>Development Group: Team ManSathi</div>
        </div>
      </div>
    </>
  );
}