"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export default function ManagerDashboard() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("approvals");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingGoals, setPendingGoals] = useState<any[]>([]);
  const [trackedGoals, setTrackedGoals] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [inlineEdits, setInlineEdits] = useState<{ [key: string]: { target: string, weightage: number } }>({});

  useEffect(() => {
    if (activeTab === "approvals") {
      fetchPending();
    } else {
      fetchTracked();
    }
  }, [activeTab, selectedQuarter]);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/get_pending_goals");
      const data = await response.json();
      if (data.success) {
        setPendingGoals(data.data);
        const edits: any = {};
        data.data.forEach((g: any) => {
          edits[g.id] = { target: g.target, weightage: g.weightage };
        });
        setInlineEdits(edits);
      }
    } catch (e) {
      console.error("Link failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracked = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/get_tracked_goals");
      const data = await response.json();
      if (data.success) {
        setTrackedGoals(data.data);
        const initialComments: any = {};
        data.data.forEach((g: any) => {
          const match = g.check_ins?.find((c: any) => c.quarter === selectedQuarter);
          if (match) initialComments[match.id] = match.manager_comment || "";
        });
        setComments(initialComments);
      }
    } catch (e) {
      console.error("Link failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineChange = (id: string, field: 'target' | 'weightage', value: any) => {
    setInlineEdits({
      ...inlineEdits,
      [id]: { ...inlineEdits[id], [field]: value }
    });
  };

  const executeAction = async (dbId: string, action: 'approve' | 'return') => {
    setProcessingId(dbId);
    const editedData = inlineEdits[dbId];
    try {
      const response = await fetch("/api/manager_action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          goal_id: dbId, 
          manager_id: localStorage.getItem("nexus_user_id") || "b26ab711-0000-0000-0000-000000000000", 
          action,
          edited_target: action === 'approve' ? editedData?.target : undefined,
          edited_weightage: action === 'approve' ? editedData?.weightage : undefined
        })
      });
      if (response.ok) {
        setPendingGoals(pendingGoals.filter(g => g.id !== dbId));
      }
    } catch (error) {
      console.error("Action failure");
    } finally {
      setProcessingId(null);
    }
  };

  const submitComment = async (checkInId: string) => {
    try {
      await fetch("/api/submit_comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ check_in_id: checkInId, comment: comments[checkInId] })
      });
      alert("FEEDBACK PROTOCOL LOGGED SUCCESSFULLY.");
    } catch (e) {
      console.error("Logging failure");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
        .aq-root { min-height: 100vh; position: relative; overflow-x: hidden; font-family: 'Syne', sans-serif; transition: background 0.3s, color 0.3s; }
        .aq-root.dark-env { background: #03030d; color: white; }
        .aq-root.light-env { background: #f6f8fc; color: #0f172a; }

        .aq-vignette { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,160,0,0.05) 0%, transparent 70%); }
        .light-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,160,0,0.02) 0%, transparent 70%); }

        .aq-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .aq-grid { background-image: linear-gradient(rgba(255,160,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,160,0,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .light-env .aq-grid { background-image: linear-gradient(rgba(15,23,42,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.015) 1px, transparent 1px); background-size: 60px 60px; }

        .mono-text { font-family: 'Space Mono', monospace; }
        
        .glass-panel { backdrop-filter: blur(10px); transition: background 0.3s, border-color 0.3s; }
        .dark-env .glass-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,160,0,0.15); }
        .light-env .glass-panel { background: #ffffff; border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .glass-input { color: inherit; padding: 6px 10px; border-radius: 6px; font-size: 13px; transition: all 0.2s ease; }
        .dark-env .glass-input { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,160,0,0.2); }
        .dark-env .glass-input:focus { outline: none; border-color: rgba(255,160,0,0.6); }
        .light-env .glass-input { background: #ffffff; border: 1px solid rgba(15,23,42,0.15); }
        .light-env .glass-input:focus { outline: none; border-color: #b45309; }

        .dark-env .amber-glow { text-shadow: 0 0 10px rgba(255,160,0,0.5); }
        .light-env .amber-glow { color: #b45309; font-weight: bold; }
      `}</style>

      <div className={`aq-root ${darkMode ? "dark-env" : "light-env"} pb-20`}>
        <div className="aq-vignette" /><div className="aq-grid" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
          {/* Header */}
          <div className="flex justify-between items-end mb-12 border-b border-gray-500/20 pb-6">
            <div>
              <p className="mono-text text-xs tracking-[0.2em] uppercase mb-2" style={{ color: darkMode ? 'rgba(255,160,0,0.6)' : '#b45309' }}>Command / Manager L1</p>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-inherit to-amber-500">Nexus Tracker Oversight</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="mono-text text-[11px] font-bold px-3 py-1.5 rounded border border-gray-500/30 hover:bg-gray-500/10 transition-all" onClick={toggleDarkMode}>
                {darkMode ? "[ LIGHT_MODE ]" : "[ CYBER_DARK ]"}
              </button>
              <Link href="/" className="mono-text text-xs tracking-widest uppercase border border-gray-500/30 px-4 py-2 rounded transition-all hover:bg-gray-500/10">
                [ Terminate Session ]
              </Link>
            </div>
          </div>

          {/* Departmental KPI Broadcast Terminal */}
          <div className="glass-panel p-6 rounded-xl mb-8 border-dashed border-amber-500/40">
            <h3 className="mono-text text-xs text-amber-600 dark:text-amber-400 tracking-widest uppercase mb-4">[ BROADCAST DEPARTMENTAL KPI PROTOCOL ]</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="mono-text text-[9px] opacity-60 block mb-1">KPI Title</label>
                <input type="text" id="kpi-title" placeholder="Unified Team Goal Name..." className="glass-input w-full" />
              </div>
              <div>
                <label className="mono-text text-[9px] opacity-60 block mb-1">Target Parameters</label>
                <input type="text" id="kpi-target" placeholder="Value..." className="glass-input w-full" />
              </div>
              <div>
                <label className="mono-text text-[9px] opacity-60 block mb-1">UoM Strategy</label>
                <select id="kpi-uom" className="glass-input w-full py-1.5">
                  <option value="Min_Percent" className={darkMode ? "bg-gray-900" : "bg-white"}>% Higher is better</option>
                  <option value="Min_Numeric" className={darkMode ? "bg-gray-900" : "bg-white"}>Num Higher is better</option>
                  <option value="Max_Percent" className={darkMode ? "bg-gray-900" : "bg-white"}>% Lower is better</option>
                  <option value="Timeline" className={darkMode ? "bg-gray-900" : "bg-white"}>Temporal (Deadline)</option>
                </select>
              </div>
              <button 
                onClick={async () => {
                  const title = (document.getElementById('kpi-title') as HTMLInputElement).value;
                  const target = (document.getElementById('kpi-target') as HTMLInputElement).value;
                  const uom_type = (document.getElementById('kpi-uom') as HTMLSelectElement).value;
                  if(!title || !target) return alert("MISSING PAYLOAD STRINGS.");
                  
                  const res = await fetch("/api/push_shared_goal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      manager_id: "demo-manager-l1",
                      title,
                      thrust_area: "Process",
                      uom_type,
                      target,
                      employee_ids: ["demo-employee-001", "demo-employee-002"]
                    })
                  });
                  if(res.ok) {
                    alert("KPI SHARING CHAIN BROADCAST SUCCESSFUL.");
                    window.location.reload();
                  }
                }} 
                className="mono-text text-xs bg-amber-500 text-white dark:text-black font-bold h-10 rounded hover:bg-amber-600 uppercase transition-all tracking-widest"
              >
                EXECUTE BROADCAST
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-gray-500/20">
            <button onClick={() => setActiveTab("approvals")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "approvals" ? 'border-b-2 border-amber-400 text-amber-500 dark:text-amber-400 amber-glow' : 'text-gray-500 hover:text-amber-500/50'}`}>
              Pending Authorizations {!isLoading && activeTab === "approvals" && `(${pendingGoals.length})`}
            </button>
            <button onClick={() => setActiveTab("checkins")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "checkins" ? 'border-b-2 border-amber-400 text-amber-500 dark:text-amber-400 amber-glow' : 'text-gray-500 hover:text-amber-500/50'}`}>
              Active Check-ins Telemetry
            </button>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="glass-panel p-12 text-center rounded-xl">
              <p className="mono-text text-amber-500 dark:text-amber-400 tracking-widest uppercase animate-pulse">ESTABLISHING DATABASE UPLINK...</p>
            </div>
          ) : activeTab === "approvals" ? (
            <div className="glass-panel rounded-xl overflow-hidden">
              {pendingGoals.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="mono-text text-gray-400 tracking-widest uppercase">ALL OPERATIVES AUTHORIZED. NO PENDING GOALS.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-amber-500/5 border-b border-gray-500/10">
                      <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Operative ID</th>
                      <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Objective</th>
                      <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Inline Target Edit</th>
                      <th className="p-5 mono-text text-[10px] uppercase tracking-widest opacity-70">Inline Weight Edit</th>
                      <th className="p-5 mono-text text-[10px] uppercase tracking-widest text-right opacity-70">Execute</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500/10">
                    {pendingGoals.map((goal) => (
                      <tr key={goal.id} className="hover:bg-amber-500/5 transition-colors">
                        <td className="p-5">
                          <div className="mono-text text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded inline-block mb-1 border border-amber-500/20">
                            {goal.user_id ? goal.user_id.substring(0, 13) : 'SYSTEM_OP'}
                          </div>
                          <div className="text-xs opacity-60 mt-1">{goal.thrust_area}</div>
                        </td>
                        <td className="p-5 text-sm max-w-xs truncate">{goal.title}</td>
                        <td className="p-5">
                          <span className="mono-text text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded mr-2 uppercase">{goal.uom_type}</span>
                          <input 
                            type={goal.uom_type === 'Timeline' ? "date" : "text"} 
                            className="glass-input w-28 font-bold"
                            value={inlineEdits[goal.id]?.target || ""}
                            onChange={(e) => handleInlineChange(goal.id, 'target', e.target.value)}
                          />
                        </td>
                        <td className="p-5">
                          <input 
                            type="number" 
                            className="glass-input w-16 font-bold"
                            value={inlineEdits[goal.id]?.weightage || 0}
                            onChange={(e) => handleInlineChange(goal.id, 'weightage', Number(e.target.value))}
                          /> <span className="text-xs text-amber-600 dark:text-amber-500">%</span>
                        </td>
                        <td className="p-5 text-right space-x-3 whitespace-nowrap">
                          {processingId === goal.id ? (
                            <span className="mono-text text-[10px] text-amber-500 animate-pulse">PROCESSING...</span>
                          ) : (
                            <>
                              <button onClick={() => executeAction(goal.id, 'return')} className="mono-text text-[10px] text-red-500 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/10 transition-all">REJECT</button>
                              <button onClick={() => executeAction(goal.id, 'approve')} className="mono-text text-[10px] text-white dark:text-black bg-amber-500 px-3 py-1.5 rounded hover:bg-amber-600 transition-all font-bold">AUTHORIZE</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-xl flex items-center justify-between mb-4">
                <span className="mono-text text-xs text-amber-600 dark:text-amber-400 font-bold">ACTIVE METRIC REVIEW TARGET:</span>
                <select className="glass-input p-2 rounded-md text-xs mono-text" value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                  <option value="Q1" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_01</option>
                  <option value="Q2" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_02</option>
                  <option value="Q3" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_03</option>
                  <option value="Q4" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_04</option>
                </select>
              </div>

              {trackedGoals.filter(g => g.check_ins?.some((c: any) => c.quarter === selectedQuarter)).length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-xl">
                  <p className="mono-text text-gray-500 text-sm tracking-widest uppercase">NO RECORDED TELEMETRY SUBMISSIONS GENERATED FOR THIS QUARTER WINDOW.</p>
                </div>
              ) : (
                trackedGoals.map((goal) => {
                  const checkIn = goal.check_ins.find((c: any) => c.quarter === selectedQuarter);
                  if (!checkIn) return null;
                  return (
                    <div key={goal.id} className="glass-panel p-6 rounded-xl border border-amber-500/20">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-500/10 pb-4 mb-4">
                        <div>
                          <span className="mono-text text-[9px] opacity-50 block">OPERATIVE OBJECTIVE</span>
                          <h4 className="text-sm font-bold">{goal.title}</h4>
                        </div>
                        <div>
                          <span className="mono-text text-[9px] opacity-50 block">PLANNED TARGET VS ACTUAL PAYLOAD</span>
                          <p className="text-xs mt-1">
                            Target: <span className="mono-text text-amber-600 dark:text-amber-400 font-bold">{goal.target}</span> | 
                            Actual: <span className="mono-text text-cyan-600 dark:text-cyan-400 font-bold ml-1">{checkIn.actual_achievement}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="mono-text text-[9px] opacity-50 block">COMPUTED PERFORMANCE INDEX</span>
                          <span className="mono-text text-xl font-black text-amber-600 dark:text-amber-400">{checkIn.progress_score}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="mono-text text-[10px] uppercase tracking-widest block opacity-70">Structured Check-in Feedback Comment</label>
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            placeholder="Type formal executive comment..." 
                            className="glass-input w-full p-2.5 text-xs rounded-md"
                            value={comments[checkIn.id] || ""}
                            onChange={(e) => setComments({ ...comments, [checkIn.id]: e.target.value })}
                          />
                          <button 
                            onClick={() => submitComment(checkIn.id)}
                            className="mono-text text-[10px] bg-amber-400 text-white dark:text-black font-bold px-6 rounded hover:bg-amber-600 transition-all uppercase tracking-widest"
                          >
                            LOG_COMMENT
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}