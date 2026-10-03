import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Upload, ArrowRight, BookOpen, MessageSquare, Zap, BarChart2, ShieldCheck } from "lucide-react";
import { AppPage, DashboardSummary, User } from "../types";
import { useCardExpansion } from "../context/CardExpansionContext";

interface DashboardPageProps {
  token: string;
  user: User;
  onNavigate: (page: AppPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ token, user, onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { triggerCardExpansion } = useCardExpansion();

  const handleCardExpand = (
    id: AppPage,
    e: React.MouseEvent<HTMLElement>,
    meta: { title: string; subtitle: string; badge?: string }
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerCardExpansion(id, rect, meta, "workspace");
    onNavigate(id);
  };

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load dashboard");
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-purple-950/40 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 glass-panel rounded-2xl p-5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="glass-panel border border-red-500/30 rounded-2xl p-6 text-sm text-red-300">
        ▲ Unable to load workspace telemetry: {error}
      </div>
    );
  }

  const { stats, recent_documents, recent_chats, weak_topics, model_config } = summary;
  const isCompletelyEmpty = stats.document_count === 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-500/15">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Welcome, {user.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
            <span>{user.institution || "University Workspace"}</span>
            {user.major && (
              <>
                <span>·</span>
                <span>{user.major}</span>
              </>
            )}
            <span>·</span>
            <span className="text-violet-400">Primary: {model_config.gemma_model}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onNavigate("documents")}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Lecture PDF</span>
          </motion.button>
          {stats.document_count > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onNavigate("chat")}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white glass-panel rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Ask Study Chat
            </motion.button>
          )}
        </div>
      </div>

      {/* Real-time Account Metrics (Zero Fake Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="glass-panel p-5 rounded-2xl border border-purple-500/20 hover:border-violet-400/60 shadow-xs transition-all"
        >
          <div className="text-xs font-mono text-slate-400">Indexed Lecture PDFs</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {stats.document_count}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            {stats.total_pages} pages · {stats.total_chunks} vector chunks
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={(e) =>
            handleCardExpand("chat", e, {
              title: "Study Chat",
              subtitle: "Ask questions directly from your notes",
              badge: "Study Chat",
            })
          }
          className="glass-panel p-5 rounded-2xl border border-purple-500/20 hover:border-violet-400/60 shadow-xs transition-all cursor-pointer"
        >
          <div className="text-xs font-mono text-slate-400">Grounded Questions & Teach</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {stats.questions_asked + stats.concepts_taught}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            {stats.questions_asked} Q&A · {stats.concepts_taught} Teach sessions
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={(e) =>
            handleCardExpand("quiz", e, {
              title: "Diagnostic Quiz",
              subtitle: "Take auto-graded diagnostic quizzes",
              badge: "Practice & Test Yourself",
            })
          }
          className="glass-panel p-5 rounded-2xl border border-purple-500/20 hover:border-violet-400/60 shadow-xs transition-all cursor-pointer"
        >
          <div className="text-xs font-mono text-slate-400">Quizzes Completed</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {stats.quizzes_completed}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            {stats.average_quiz_score !== null
              ? `Avg Score: ${stats.average_quiz_score}%`
              : "No quizzes graded yet"}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={(e) =>
            handleCardExpand("progress", e, {
              title: "Knowledge Gaps",
              subtitle: "Target topics diagnosed below 80%",
              badge: "Know Your Weak Spots",
            })
          }
          className="glass-panel p-5 rounded-2xl border border-purple-500/20 hover:border-violet-400/60 shadow-xs transition-all cursor-pointer"
        >
          <div className="text-xs font-mono text-slate-400">Identified Weak Topics</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {weak_topics.length}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            {stats.active_study_plans} active revision plans
          </div>
        </motion.div>
      </div>

      {/* Empty State when New User has 0 Documents */}
      {isCompletelyEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-glow border border-violet-500/30 rounded-3xl p-8 lg:p-10 shadow-xl"
        >
          <div className="max-w-2xl space-y-4">
            <div className="text-xs font-mono text-violet-400 font-semibold tracking-wider">
              ● EMPTY WORKSPACE · READY FOR FIRST LECTURE UPLOAD
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              Your StudyMate AI account starts with zero pre-populated data.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              StudyMate AI never fabricates documents, answers, or progress statistics. Upload your first lecture PDF (or generate a real multi-page sample lecture PDF in the Documents tab) to unlock grounded Study Chat, 6-part Teach Me explanations, Quizzes, Knowledge Gap analysis, and Revision Plans.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onNavigate("documents")}
                className="px-5 py-3 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Go to Documents & Upload PDF</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Populated Workspace Overview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white font-display">
                  Indexed Course Documents
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("documents")}
                  className="text-xs font-mono text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  Manage Documents →
                </button>
              </div>
              <div className="divide-y divide-purple-500/15">
                {recent_documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {doc.filename}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                        {doc.course_tag} · {doc.page_count} pages · {doc.chunk_count} indexed chunks
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate("chat")}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white glass-panel rounded-lg whitespace-nowrap cursor-pointer"
                    >
                      Query PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white font-display">
                  Recent Grounded Study Chat
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("chat")}
                  className="text-xs font-mono text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  Open Study Chat →
                </button>
              </div>
              {recent_chats.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 font-mono">
                  No questions asked yet. Open Study Chat to ask 2-Mark, 5-Mark, or 10-Mark exam questions from your uploaded PDFs.
                </div>
              ) : (
                <div className="divide-y divide-purple-500/15">
                  {recent_chats.map((c) => (
                    <div key={c.id} className="py-3 space-y-1">
                      <div className="text-xs font-medium text-white line-clamp-1">
                        Q: {c.question}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {c.answer}
                      </div>
                      <div className="text-[10px] text-violet-400 font-mono">
                        Mode: {c.mode} · {c.sources.length} sources cited
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white font-display">
                  Identified Weak Topics
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("progress")}
                  className="text-xs font-mono text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  View Telemetry →
                </button>
              </div>
              {weak_topics.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 font-mono">
                  No weak topics diagnosed. Complete a quiz to analyze topic accuracy.
                </div>
              ) : (
                <div className="space-y-3">
                  {weak_topics.map((wt, i) => (
                    <div
                      key={i}
                      className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 font-medium">{wt.topic}</span>
                      <span className="font-mono text-amber-400 font-semibold">{wt.accuracy}%</span>
                    </div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => onNavigate("plan")}
                    className="w-full mt-3 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors cursor-pointer"
                  >
                    Build Targeted Study Plan →
                  </motion.button>
                </div>
              )}
            </div>

            {/* Signature Feature Shortcut */}
            <div
              onClick={(e) =>
                handleCardExpand("rescue", e, {
                  title: "Last-Minute Rescue Sheet",
                  subtitle: "15-minute high yield definitions, core formulas and traps",
                  badge: "15-Min Pre-Exam Protocol",
                })
              }
              className="glass-panel-glow border border-violet-500/30 rounded-3xl p-6 space-y-3 shadow-lg cursor-pointer hover:border-violet-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    Last-Minute Rescue Sheet
                  </h3>
                  <div className="text-[10px] font-mono text-violet-400">15-MIN PRE-EXAM PROTOCOL</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Synthesize high-yield definitions, core formulas, and exam traps from your documents in one click.
              </p>
              <button
                type="button"
                className="w-full py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-colors cursor-pointer"
              >
                Synthesize Rescue Sheet →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
