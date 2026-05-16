"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export default function EmployeeDashboard() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("architecture");
  const [goals, setGoals] = useState<any[]>([{ title: "", thrustArea: "", uom: "Min_Numeric", target: "", weightage: 10 }]);
  const [lockedGoals, setLockedGoals] = useState<any[]>([]);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [actuals, setActuals] = useState<{ [key: string]: { value: string, status: string } }>({});
  const [calculatedScores, setCalculatedScores] = useState<{ [key: string]: number }>({});

  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);

  useEffect(() => {
    fetchGoalsAndDrafts();
  }, [activeTab, selectedQuarter]);

  const fetchGoalsAndDrafts = async () => {
    try {
      const response = await fetch("/api/get_locked_goals");
      const data = await response.json();
      if (data.success) {
        setLockedGoals(data.data.filter((g: any) => g.is_locked === true));
        
        const sharedDrafts = data.data.filter((g: any) => g.is_locked === false && g.parent_goal_id);
        if (sharedDrafts.length > 0 && goals.length === 1 && goals[0].title === "") {
          setGoals(sharedDrafts.map((g: any) => ({
            id: g.id,
            parent_goal_id: g.parent_goal_id,
            title: g.title,
            thrustArea: g.thrust_area,
            uom: g.uom_type,
            target: g.target,
            weightage: g.weightage
          })));
        }

        const initialActuals: any = {};
        data.data.forEach((g: any) => {
          const match = g.check_ins?.find((c: any) => c.quarter === selectedQuarter);
          initialActuals[g.id] = {
            value: match ? match.actual_achievement : "",
            status: match ? match.status : "Not Started"
          };
          if (match) {
            setCalculatedScores(prev => ({ ...prev, [g.id]: match.progress_score }));
          }
        });
        setActuals(initialActuals);
      }
    } catch (e) {
      console.error("Telemetry link lost");
    }
  };

  const addGoal = () => {
    if (goals.length < 8) setGoals([...goals, { title: "", thrustArea: "", uom: "Min_Numeric", target: "", weightage: 10 }]);
  };

  const updateGoal = (index: number, field: string, value: string | number) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setGoals(newGoals);
  };

  const transmitData = async () => {
    setStatus({ state: "loading", message: "ESTABLISHING UPLINK TO CORE LEDGER..." });
    try {
      const response = await fetch("/api/submit_goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "demo-employee-001", goals })
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ state: "success", message: "TRANSMISSION SUCCESSFUL. GOALS WRITTEN TO NEXUS TRACKER LEDGER." });
        setTimeout(() => setStatus({ state: "idle", message: "" }), 5000);
      } else {
        setStatus({ state: "error", message: `SYSTEM REJECT: ${data.error}` });
      }
    } catch (error) {
      setStatus({ state: "error", message: "CRITICAL FAILURE: BACKEND UNREACHABLE." });
    }
  };

  const transmitTelemetry = async (goalId: string) => {
    const dataPack = actuals[goalId];
    if (!dataPack?.value) return;

    setStatus({ state: "loading", message: `COMPUTING SCORE FOR OBJECTIVE ${goalId.substring(0,6)}...` });
    try {
      const response = await fetch("/api/calculate_progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_id: goalId,
          quarter: selectedQuarter,
          actual_achievement: dataPack.value,
          status: dataPack.status
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCalculatedScores(prev => ({ ...prev, [goalId]: data.score }));
        setStatus({ state: "success", message: `SCORE CALCULATED: ${data.score}% SYNCED OVER ALL NODES.` });
        setTimeout(() => setStatus({ state: "idle", message: "" }), 4000);
      } else {
        setStatus({ state: "error", message: `CALCULATION REJECTED: ${data.error}` });
      }
    } catch (e) {
      setStatus({ state: "error", message: "TELEMETRY DISCONNECT." });
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
        .dark-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.05) 0%, transparent 70%); }
        .light-env .aq-vignette { background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.02) 0%, transparent 70%); }

        .aq-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dark-env .aq-grid { background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .light-env .aq-grid { background-image: linear-gradient(rgba(15,23,42,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.015) 1px, transparent 1px); background-size: 60px 60px; }

        .mono-text { font-family: 'Space Mono', monospace; }
        
        .glass-panel { backdrop-filter: blur(10px); transition: background 0.3s, border-color 0.3s; }
        .dark-env .glass-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(0,212,255,0.15); }
        .light-env .glass-panel { background: #ffffff; border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .glass-input { color: inherit; transition: all 0.2s ease; }
        .dark-env .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.2); }
        .dark-env .glass-input:focus { outline: none; border-color: rgba(0,212,255,0.8); box-shadow: 0 0 15px rgba(0,212,255,0.2); }
        .light-env .glass-input { background: #ffffff; border: 1px solid rgba(15,23,42,0.15); }
        .light-env .glass-input:focus { outline: none; border-color: #0284c7; box-shadow: 0 0 10px rgba(2,132,199,0.15); }

        .dark-env .cyan-glow { text-shadow: 0 0 10px rgba(0,212,255,0.5); }
        .light-env .cyan-glow { color: #0284c7; font-weight: bold; }
      `}</style>

      <div className={`aq-root ${darkMode ? "dark-env" : "light-env"} pb-20`}>
        <div className="aq-vignette" /><div className="aq-grid" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12">
          {/* Header */}
          <div className="flex justify-between items-end mb-12 border-b border-gray-500/20 pb-6">
            <div>
              <p className="mono-text text-xs tracking-[0.2em] uppercase mb-2" style={{ color: darkMode ? 'rgba(0,212,255,0.6)' : '#0284c7' }}>Workspace / Employee</p>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-inherit to-cyan-500">Nexus Tracker Workspace</h1>
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

          {/* Sub-Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-gray-500/20">
            <button onClick={() => setActiveTab("architecture")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "architecture" ? 'border-b-2 border-cyan-400 text-cyan-400 cyan-glow' : 'text-gray-500 hover:text-cyan-500/50'}`}>
              Phase 1: Goal Architecture
            </button>
            <button onClick={() => setActiveTab("telemetry")} className={`mono-text text-xs tracking-widest pb-4 uppercase transition-all ${activeTab === "telemetry" ? 'border-b-2 border-cyan-400 text-cyan-400 cyan-glow' : 'text-gray-500 hover:text-cyan-500/50'}`}>
              Phase 2: Quarterly Telemetry
            </button>
          </div>

          {/* Terminal Logs */}
          {status.state !== "idle" && (
            <div className={`mb-6 p-4 rounded-lg border mono-text text-xs tracking-widest uppercase ${status.state === 'success' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' : status.state === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-gray-500/10 border-gray-400 animate-pulse'}`}>
              &amp;gt; {status.message}
            </div>
          )}

          {/* Tab 1: Architecture Creation Mode */}
          {activeTab === "architecture" && (
            <>
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <div key={index} className="glass-panel p-6 rounded-xl relative group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="mono-text text-xs text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">SEQ_0{index + 1}</span>
                      {goals.length > 1 && !goal.parent_goal_id && (
                        <button onClick={() => setGoals(goals.filter((_, i) => i !== index))} className="mono-text text-xs text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">[ DELETE ]</button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="col-span-2">
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block opacity-70">Thrust Area</label>
                        <select disabled={!!goal.parent_goal_id} className={`glass-input w-full p-2.5 rounded-lg text-sm ${goal.parent_goal_id ? 'opacity-50 cursor-not-allowed bg-gray-500/10' : ''}`} value={goal.thrustArea} onChange={(e) => updateGoal(index, "thrustArea", e.target.value)}>
                          <option value="" className={darkMode ? "bg-gray-900" : "bg-white"}>Select Protocol...</option>
                          <option value="Financial" className={darkMode ? "bg-gray-900" : "bg-white"}>Financial</option>
                          <option value="Customer" className={darkMode ? "bg-gray-900" : "bg-white"}>Customer Focus</option>
                          <option value="Process" className={darkMode ? "bg-gray-900" : "bg-white"}>Internal Process</option>
                          <option value="Learning" className={darkMode ? "bg-gray-900" : "bg-white"}>Learning &amp; Growth</option>
                        </select>
                      </div>
                      <div className="col-span-4">
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block opacity-70">
                          Objective Title {goal.parent_goal_id && <span className="text-[9px] text-amber-500 font-mono ml-2">[SHARED KPI - READ ONLY]</span>}
                        </label>
                        <input type="text" disabled={!!goal.parent_goal_id} className={`glass-input w-full p-2.5 rounded-lg text-sm ${goal.parent_goal_id ? 'opacity-50 cursor-not-allowed bg-gray-500/10 text-gray-400' : ''}`} value={goal.title} onChange={(e) => updateGoal(index, "title", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block opacity-70">UoM Strategy</label>
                        <select disabled={!!goal.parent_goal_id} className={`glass-input w-full p-2.5 rounded-lg text-sm ${goal.parent_goal_id ? 'opacity-50 cursor-not-allowed bg-gray-500/10' : ''}`} value={goal.uom} onChange={(e) => updateGoal(index, "uom", e.target.value)}>
                          <option value="Min_Numeric" className={darkMode ? "bg-gray-900" : "bg-white"}>Numeric (Higher is Better)</option>
                          <option value="Max_Numeric" className={darkMode ? "bg-gray-900" : "bg-white"}>Numeric (Lower is Better)</option>
                          <option value="Min_Percent" className={darkMode ? "bg-gray-900" : "bg-white"}>% (Higher is Better)</option>
                          <option value="Max_Percent" className={darkMode ? "bg-gray-900" : "bg-white"}>% (Lower is Better)</option>
                          <option value="Timeline" className={darkMode ? "bg-gray-900" : "bg-white"}>Temporal (Date Limit)</option>
                          <option value="Zero" className={darkMode ? "bg-gray-900" : "bg-white"}>Zero-Based (Defect Target)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block opacity-70">Planned Target</label>
                        <input type={goal.uom === 'Timeline' ? "date" : "text"} disabled={!!goal.parent_goal_id} className={`glass-input w-full p-2.5 rounded-lg text-sm ${goal.parent_goal_id ? 'opacity-50 cursor-not-allowed bg-gray-500/10 text-gray-400' : ''}`} value={goal.target} onChange={(e) => updateGoal(index, "target", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block text-cyan-500 font-bold">Weightage Allocation (%)</label>
                        <input type="number" className="glass-input w-full p-2.5 rounded-lg text-sm text-cyan-600 dark:text-cyan-300 font-bold" value={goal.weightage} onChange={(e) => updateGoal(index, "weightage", Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 glass-panel p-6 rounded-xl flex items-center justify-between">
                <button onClick={addGoal} disabled={goals.length >= 8} className={`mono-text text-xs tracking-widest px-6 py-3 rounded-lg border transition-all ${goals.length >= 8 ? 'border-gray-400 text-gray-400 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10'}`}>
                  + INITIALIZE NEW GOAL {goals.length >= 8 && "(MAX 8)"}
                </button>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="mono-text text-[10px] opacity-50 tracking-widest uppercase">Total Aggregation</div>
                    <div className={`text-2xl font-bold mono-text ${totalWeightage === 100 ? 'text-cyan-500 dark:text-cyan-400 cyan-glow' : 'text-red-500'}`}>{totalWeightage}%</div>
                  </div>
                  <button onClick={transmitData} disabled={totalWeightage !== 100} className={`mono-text text-xs tracking-widest px-8 py-3 rounded-lg transition-all ${totalWeightage === 100 ? 'bg-cyan-500 text-white dark:text-black font-bold hover:bg-cyan-600' : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}>
                    TRANSMIT STRUCTURE
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Telemetry Interface Mode */}
          {activeTab === "telemetry" && (
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-xl flex items-center justify-between mb-4">
                <span className="mono-text text-xs text-cyan-600 dark:text-cyan-400 font-bold">SELECT REPORTING TARGET WINDOW:</span>
                <select className="glass-input p-2 rounded-md text-xs mono-text" value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                  <option value="Q1" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_01 (JULY WINDOW)</option>
                  <option value="Q2" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_02 (OCT WINDOW)</option>
                  <option value="Q3" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_03 (JAN WINDOW)</option>
                  <option value="Q4" className={darkMode ? "bg-gray-900" : "bg-white"}>QUARTER_04 (ANNUAL CLOSURE)</option>
                </select>
              </div>

              {lockedGoals.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-xl">
                  <p className="mono-text text-gray-500 text-sm tracking-widest uppercase">NO ACTIVE LOCKED OBJECTIVES FOUND IN PROTOCOL SCHEMA.</p>
                </div>
              ) : (
                lockedGoals.map((goal) => (
                  <div key={goal.id} className="glass-panel p-6 rounded-xl border border-cyan-500/20">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-500/10 pb-3">
                      <div>
                        <h4 className="text-lg font-bold">{goal.title}</h4>
                        <span className="mono-text text-[10px] opacity-60 uppercase tracking-wider">{goal.thrust_area} Matrix · Allocation: {goal.weightage}%</span>
                      </div>
                      <div className="text-right">
                        <span className="mono-text text-[10px] block opacity-50">TARGET PARAMETER</span>
                        <span className="mono-text text-sm font-bold text-cyan-600 dark:text-cyan-400">{goal.target} <span className="text-[10px] text-gray-500">({goal.uom_type})</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block opacity-70">Actual Capture Input</label>
                        <input 
                          type={goal.uom_type === 'Timeline' ? "date" : "text"} 
                          placeholder="Log metric payload..." 
                          className="glass-input w-full p-2 text-sm rounded-md"
                          value={actuals[goal.id]?.value || ""}
                          onChange={(e) => setActuals({
                            ...actuals,
                            [goal.id]: { ...actuals[goal.id], value: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <label className="mono-text text-[10px] uppercase tracking-widest mb-2 block opacity-70">Operative Status</label>
                        <select 
                          className="glass-input w-full p-2 text-sm rounded-md"
                          value={actuals[goal.id]?.status || "Not Started"}
                          onChange={(e) => setActuals({
                            ...actuals,
                            [goal.id]: { ...actuals[goal.id], status: e.target.value }
                          })}
                        >
                          <option value="Not Started" className={darkMode ? "bg-gray-900" : "bg-white"}>Not Started</option>
                          <option value="On Track" className={darkMode ? "bg-gray-900" : "bg-white"}>On Track</option>
                          <option value="Completed" className={darkMode ? "bg-gray-900" : "bg-white"}>Completed</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <button 
                          onClick={() => transmitTelemetry(goal.id)}
                          className="mono-text text-[10px] bg-cyan-500 text-white dark:text-black font-bold px-4 py-2.5 rounded hover:bg-cyan-600 transition-all flex-1 text-center tracking-widest"
                        >
                          COMPUTE
                        </button>
                        <div className="text-right min-w-[70px]">
                          <span className="mono-text text-[9px] block text-gray-500">SCORE</span>
                          <span className="mono-text text-sm font-black text-cyan-600 dark:text-cyan-400">{calculatedScores[goal.id] !== undefined ? `${calculatedScores[goal.id]}%` : "0%"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}