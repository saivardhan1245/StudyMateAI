import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, CheckSquare, Square, Calendar, Clock, BookOpen, CheckCircle } from "lucide-react";
import { AppPage, DocumentItem, StudyPlanItem } from "../types";

interface StudyPlanPageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

export const StudyPlanPage: React.FC<StudyPlanPageProps> = ({ token, onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [plans, setPlans] = useState<StudyPlanItem[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlanItem | null>(null);
  const [daysCount, setDaysCount] = useState(5);
  const [dailyHours, setDailyHours] = useState(2);
  const [customFocus, setCustomFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [docRes, planRes] = await Promise.all([
          fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/study-plans", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const docData = await docRes.json();
        const planData = await planRes.json();
        if (docRes.ok) setDocuments(docData.documents || []);
        if (planRes.ok) {
          const list = planData.plans || [];
          setPlans(list);
          if (list.length > 0) setActivePlan(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;
    setError(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/study-plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days_count: daysCount,
          daily_hours: dailyHours,
          custom_focus: customFocus.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to generate study plan.");
      setPlans((prev) => [data.plan, ...prev]);
      setActivePlan(data.plan);
      setCustomFocus("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (planId: string, taskId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/study-plans/${planId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      const data = await res.json();
      if (res.ok) {
        setActivePlan(data.plan);
        setPlans((prev) => prev.map((p) => (p.id === data.plan.id ? data.plan : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-xs text-violet-400 py-8 font-mono">Loading Revision Study Planner...</div>;
  }

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-glow border border-purple-500/30 rounded-3xl p-8 lg:p-10 space-y-4 shadow-xl"
      >
        <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
          ▲ NO SYLLABUS OR LECTURE PDFS UPLOADED
        </div>
        <h1 className="text-2xl font-bold text-white font-display">
          Upload your lecture PDFs before creating a revision schedule.
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          StudyMate AI builds day-by-day revision plans grounded in your uploaded lecture documents and weak topics identified from your quizzes.
        </p>
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onNavigate("documents")}
            className="px-5 py-3 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Course Material</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const completedTasksCount = activePlan
    ? activePlan.tasks.filter((t) => t.completed).length
    : 0;

  return (
    <div className="space-y-8">
      <div className="pb-5 border-b border-purple-500/15">
        <h1 className="text-2xl font-bold text-white font-display">
          Grounded Revision Study Planner
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Synthesizes your uploaded lecture chunks + quiz weak topics into a structured day-by-day timeline.
        </p>
      </div>

      {/* Plan Generator Bar */}
      <form onSubmit={handleGeneratePlan} className="glass-panel-glow border border-purple-500/25 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Focus Goal or Exam Area (Optional)
            </label>
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="e.g., Midterm Exam on Virtual Memory & Page Replacement"
              className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Days to Exam
            </label>
            <select
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
            >
              {[3, 5, 7, 10, 14].map((d) => (
                <option key={d} value={d}>{d} Days</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Hours / Day
            </label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
            >
              {[1, 2, 3, 4, 6].map((h) => (
                <option key={h} value={h}>{h} hrs/day</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={generating}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 cursor-pointer"
            >
              {generating ? "Architecting Schedule..." : "Architect Study Plan"}
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300">
            ▲ {error}
          </div>
        )}
      </form>

      {activePlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/25 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/15 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    {activePlan.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {activePlan.days_remaining} Days · {activePlan.daily_hours} hrs/day · {activePlan.tasks.length} total milestones
                  </p>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <div className="text-base font-bold text-violet-300">
                    {completedTasksCount} / {activePlan.tasks.length} Complete
                  </div>
                  <div className="text-xs text-slate-400">
                    {Math.round((completedTasksCount / (activePlan.tasks.length || 1)) * 100)}% progress
                  </div>
                </div>
              </div>

              {/* Day-by-Day Timeline */}
              <div className="space-y-6 relative">
                {Array.from({ length: activePlan.days_remaining }, (_, i) => i + 1).map((dayNum) => {
                  const dayTasks = activePlan.tasks.filter((t) => t.day_number === dayNum);
                  if (dayTasks.length === 0) return null;

                  return (
                    <div key={dayNum} className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 font-mono text-xs font-bold flex items-center justify-center">
                          D{dayNum}
                        </span>
                        <span className="text-sm font-bold text-white font-display">
                          Day {dayNum} Revision Agenda
                        </span>
                      </div>

                      <div className="space-y-2.5 pl-4 sm:pl-6 border-l-2 border-purple-500/20">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(activePlan.id, task.id, task.completed)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                              task.completed
                                ? "bg-emerald-950/20 border-emerald-500/30 text-slate-400"
                                : "glass-panel border-purple-500/20 hover:border-violet-400/50 text-slate-200"
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 text-violet-400 hover:text-violet-300 shrink-0"
                            >
                              {task.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                                {task.topic} ({task.duration_minutes} mins)
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                Source: {task.source_reference} · {task.activity_type}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white font-display">Study Plans</h3>
              {plans.length === 0 ? (
                <div className="text-xs text-slate-400 font-mono">No study plans created yet.</div>
              ) : (
                <div className="space-y-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePlan(p)}
                      className={`w-full p-3 text-left rounded-xl text-xs transition-all cursor-pointer ${
                        activePlan.id === p.id
                          ? "bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30"
                          : "glass-panel text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="truncate font-medium">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.days_remaining} Days · {p.tasks.filter((t) => t.completed).length}/{p.tasks.length} done
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 text-center text-xs text-slate-400 font-mono border border-purple-500/20">
          Click "Architect Study Plan" above to generate a grounded day-by-day revision checklist.
        </div>
      )}
    </div>
  );
};
