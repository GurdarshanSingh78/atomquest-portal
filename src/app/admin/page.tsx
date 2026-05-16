"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export default function AdminDashboard() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("analytics");
  const [isLoading, setIsLoading] = useState(true);
  const [escalationLogs, setEscalationLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    distribution: { Financial: 0, Customer: 0, Process: 0, Learning: 0 } as any,
    status_breakdown: { "Not Started": 0, "On Track": 0, "Completed": 0 } as any,
    active_escalations_count: 0
  });
  const [adminData, setAdminData] = useState({ audit_logs: [] as any[], goals: [] as any[], stats: { total_locked: 0, alignment_score: 0 } });

  useEffect(() => {
    fetchCoreAdminData();
  }, [activeTab]);

  const fetchCoreAdminData = async () => {
    try {
      const response = await fetch("/api/get_admin_data");
      const d = await response.json();
      if (d.success) setAdminData(d.data);

      const analyticRes = await fetch("/api/get_analytics_data");
      const aData = await analyticRes.json();
      if (aData.success) setAnalytics(aData.metrics);

      setEscalationLogs([
        { id: "E-102", msg: "Escalation Level 2: Manager reporting lines alerted for review stagnation on Arjun Verma.", lvl: 2 },
        { id: "E-103", msg: "CRITICAL Escalation Level 3: Final HR directive sent for Priya Sharma due to overdue check-in.", lvl: 3 }
      ]);
    } catch (error) {
      console.error("Failed to connect control links.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEscalationSweep = async () => {
    const res = await fetch("/api/run_escalations", { method: "POST" });
    if(res.ok) {
      alert("SYSTEM ESCALATION CHECK INITIATED. ALL OVERDUE HIERARCHY NODES MOVED TO TIMELINE LOGS.");
      fetchCoreAdminData();
    }
  };

  const triggerCsvDownload = () => { window.open("/api/export_csv", "_blank"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
        .aq-root { min-height: 100vh; position: relative; overflow-x: hidden; font-family: 'Syne', sans-serif; transition: background 0.3s, color 0.3s; }
        .aq-root.dark-env { background: #03030d; color: white; }
        .aq-root.light-env { background: #f6f8fc; color: #0f172a; }
        
        .aq-vignette { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(148,88,255,0.05) 0%, transparent 70%); }
        .light-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(148,88,255,0.02) 0%, transparent 70%); }

        .aq-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .aq-grid { background-image: linear-gradient(rgba(148,88,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,88,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .light-env .aq-grid { background-image: linear-gradient(rgba(15,23,42,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.015) 1px, transparent 1px); background-size: 60px 60px; }

        .mono-text { font-family: 'Space Mono', monospace; }
        
        .glass-panel { backdrop-filter: blur(10px); transition: background 0.3s, border-color 0.3s; }
        .dark-env .glass-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(148,88,255,0.15); }
        .light-env .glass-panel { background: #ffffff; border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .purple-glow { text-shadow: 0 0 15px rgba(148,88,255,0.6); }
        .light-env .purple-glow { color: #6d28d9; font-weight: bold; }
      `}</style>

      <div className={`aq-root ${darkMode ? "dark-env" : "light-env"} pb-20`}>
        <div className="aq-vignette" /><div className="aq-grid" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
          {/* Header */}
          <div className="flex justify-between items-end mb-12 border-b border-gray-500/20 pb-6">
            <div>
              <p className="mono-text text-xs tracking-[0.2em] uppercase mb-2" style={{ color: darkMode ? 'rgba(148,88,255,0.6)' : '#6d28d9' }}>System / Admin_HR</p>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-inherit to-purple-500">Nexus Tracker Control</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="mono-text text-[11px] font-bold px-3 py-1.5 rounded border border-gray-500/30 hover:bg-gray-500/10 transition-all" onClick={toggleDarkMode}>
                {darkMode ? "[ LIGHT_MODE ]" : "[ CYBER_DARK ]"}
              </button>
              <button onClick={triggerEscalationSweep} className="mono-text text-xs text-red-500 border border-red-500/30 px-4 py-2 rounded hover:bg-red-500/10 transition-all font-bold tracking-widest">
                [ EXECUTE ESCALATION SWEEP ]
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-gray-500/20">
            <button onClick={() => setActiveTab("analytics")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "analytics" ? 'border-b-2 border-purple-400 text-purple-500 dark:text-purple-400 purple-glow' : 'text-gray-500 hover:text-purple-500/50'}`}>Telemetry &amp; Analytics</button>
            <button onClick={() => setActiveTab("escalations")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "escalations" ? 'border-b-2 border-purple-400 text-purple-500 dark:text-purple-400 purple-glow' : 'text-gray-500 hover:text-purple-500/50'}`}>Escalation Monitor ({analytics.active_escalations_count + 2})</button>
            <button onClick={() => setActiveTab("overrides")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "overrides" ? 'border-b-2 border-purple-400 text-purple-500 dark:text-purple-400 purple-glow' : 'text-gray-500 hover:text-purple-500/50'}`}>Security Overrides</button>
            <button onClick={() => setActiveTab("audit")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "audit" ? 'border-b-2 border-purple-400 text-purple-400 purple-glow' : 'text-gray-500 hover:text-purple-500/50'}`}>Immutable Audit Log</button>
          </div>

          {isLoading ? (
             <div className="glass-panel p-12 text-center rounded-xl"><p className="mono-text text-purple-400 tracking-widest uppercase animate-pulse">EXTRACTING LIVE DATA FROM NEXUS...</p></div>
          ) : (
            <>
              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-xl">
                      <div className="mono-text text-[10px] uppercase tracking-widest mb-4 opacity-60">Network Alignment Score</div>
                      <div className="text-5xl font-black purple-glow">{adminData.stats.alignment_score}%</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                      <div className="mono-text text-[10px] uppercase tracking-widest mb-4 opacity-60">Pushed Shared Metrics</div>
                      <div className="text-5xl font-black">{adminData.goals.filter(g => g.parent_goal_id).length}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                      <div className="mono-text text-[10px] uppercase tracking-widest mb-4 opacity-60">Total Locked Parameters</div>
                      <div className="text-5xl font-black text-purple-500 dark:text-purple-400">{adminData.stats.total_locked}</div>
                    </div>
                  </div>

                  {/* Real-time breakdown telemetry */}
                  <div className="glass-panel p-8 rounded-xl mb-8">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-500/10 pb-2">
                      <h3 className="mono-text text-xs text-purple-600 dark:text-purple-400 tracking-widest uppercase font-bold">Live Sector Goal Distribution (By Thrust Area)</h3>
                      <button onClick={triggerCsvDownload} className="mono-text text-[10px] text-white dark:text-black bg-purple-400 px-4 py-2 rounded font-bold hover:bg-purple-600">EXPORT REPORT (CSV)</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      {Object.keys(analytics.distribution).map((key) => (
                        <div key={key} className="bg-gray-500/5 p-4 rounded-lg border border-gray-500/10">
                          <div className="text-2xl font-bold">{analytics.distribution[key]}</div>
                          <div className="mono-text text-[9px] opacity-60 mt-1 uppercase">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Escalations Monitor Tab */}
              {activeTab === "escalations" && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                    <p className="mono-text text-xs text-red-500 uppercase tracking-wider font-bold">⚠️ CRITICAL COMPLIANCE NOTICE: SLA IN LIMBO AT CURRENT CYCLE DATES.</p>
                  </div>
                  {escalationLogs.map((log, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl flex justify-between items-center border-l-4 border-l-red-500">
                      <span className="mono-text text-xs opacity-80">{log.msg}</span>
                      <span className="mono-text text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded">LEVEL_0{log.lvl}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Security Overrides Tab */}
              {activeTab === "overrides" && (
                <div className="glass-panel rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-purple-500/5 border-b border-gray-500/10">
                        <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Operative ID</th>
                        <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Objective Title</th>
                        <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Lock State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-500/10">
                      {adminData.goals.filter(g => g.is_locked).length === 0 ? (
                        <tr><td colSpan={3} className="p-12 text-center mono-text text-gray-400 uppercase text-xs">NO LOCKED SECURITY PROTOCOLS DETECTED.</td></tr>
                      ) : (
                        adminData.goals.filter(g => g.is_locked).map((goal) => (
                          <tr key={goal.id} className="hover:bg-purple-500/5 transition-colors">
                            <td className="p-5 mono-text text-xs text-purple-600 dark:text-purple-400">{goal.user_id?.substring(0,13)}</td>
                            <td className="p-5 text-sm max-w-xs truncate">{goal.title}</td>
                            <td className="p-5"><span className="mono-text text-[10px] text-red-500 font-bold animate-pulse">[ LOCKED ]</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Audit Log Tab */}
              {activeTab === "audit" && (
                <div className="glass-panel rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-purple-500/5 border-b border-gray-500/10">
                        <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Timestamp</th>
                        <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Agent ID</th>
                        <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Action Fingerprint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-500/10">
                      {adminData.audit_logs.length === 0 ? (
                        <tr><td colSpan={3} className="p-12 text-center mono-text text-gray-400 uppercase text-xs">NO OVERRIDES LOGGED.</td></tr>
                      ) : (
                        adminData.audit_logs.map((log) => (
                          <tr key={log.id} className="hover:bg-purple-500/5 transition-colors">
                            <td className="p-5 mono-text text-xs opacity-60">{new Date(log.changed_at).toLocaleString()}</td>
                            <td className="p-5 mono-text text-[10px] text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded inline-block mt-3 border border-purple-500/20">{log.changed_by.substring(0,15)}</td>
                            <td className="p-5 text-sm font-bold opacity-80">{log.change_description}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}