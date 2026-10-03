import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, GraduationCap, CheckCircle, ChevronDown, ChevronUp, BookOpen, AlertTriangle } from "lucide-react";
import { AppPage, DocumentItem, TeachExplanationItem } from "../types";

interface TeachMePageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

export const TeachMePage: React.FC<TeachMePageProps> = ({ token, onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sessions, setSessions] = useState<TeachExplanationItem[]>([]);
  const [activeSession, setActiveSession] = useState<TeachExplanationItem | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [docRes, teachRes] = await Promise.all([
          fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/teach/history", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const docData = await docRes.json();
        const teachData = await teachRes.json();
        if (docRes.ok) setDocuments(docData.documents || []);
        if (teachRes.ok) {
          const list = teachData.sessions || [];
          setSessions(list);
          if (list.length > 0) setActiveSession(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || generating) return;
    setError(null);
    setGenerating(true);
    setSelectedOption(null);

    try {
      const res = await fetch("/api/teach/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to generate concept breakdown.");
      }
      setSessions((prev) => [data.session, ...prev]);
      setActiveSession(data.session);
      setTopic("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-violet-400 py-8 font-mono">Loading Teach Me classroom...</div>;
  }

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-glow border border-purple-500/30 rounded-3xl p-8 lg:p-10 space-y-4 shadow-xl"
      >
        <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
          ▲ NO LECTURE DOCUMENTS INDEXED
        </div>
        <h1 className="text-2xl font-bold text-white font-display">
          Upload your lecture PDFs before starting a Teach Me lesson.
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Teach Me translates complex university concepts into clear mental models, worked examples, and exam pitfalls using strictly your uploaded course slides.
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
        className="pb-5 border-b border-purple-500/15"
      >
        <h1 className="text-2xl font-bold text-white font-display">
          Teach Me: 6-Stage Conceptual Breakdown
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Pedagogical structure: Intuition → Grounded Concept → Worked Example → Exam Points → Traps → Quick Check
        </p>
      </motion.div>

      {/* Concept Query Form (Stagger 2) */}
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        onSubmit={handleExplain}
        className="glass-panel-glow border border-purple-500/25 rounded-3xl p-6 space-y-4 shadow-xl"
      >
        <label className="block text-xs font-bold text-slate-200">
          What concept from your uploaded lecture notes should StudyMate AI teach you?
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Translation Lookaside Buffer (TLB), Demand Paging, or Vanishing Gradients..."
            disabled={generating}
            className="flex-1 px-4 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={generating || !topic.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 whitespace-nowrap cursor-pointer"
          >
            {generating ? "Retrieving Chunks & Teaching..." : "Teach Me This Concept"}
          </motion.button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-400">Suggested syllabus topics:</span>
          {[
            "Translation Lookaside Buffer (TLB) & Effective Access Time",
            "Demand Paging & Page Faults",
            "Belady's Anomaly vs LRU Page Replacement",
            "Thrashing & Working Set Model",
          ].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className="text-xs text-violet-400 hover:text-violet-300 font-mono cursor-pointer"
            >
              {t} ·
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300">
            ▲ {error}
          </div>
        )}
      </motion.form>

      {activeSession ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.22, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 space-y-7 border border-purple-500/25 shadow-xl"
            >
              <div className="pb-4 border-b border-purple-500/15 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-violet-400 font-semibold tracking-wider">
                    GROUNDED 6-STAGE LESSON
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 font-display">
                    {activeSession.topic}
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                  {activeSession.model_used}
                </span>
              </div>

              {/* 01. Intuition */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  01. Intuition — Why This Exists
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeSession.intuition}
                </p>
              </div>

              {/* 02. Core Concept */}
              <div className="pt-6 border-t border-purple-500/15 space-y-2">
                <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  02. Core Concept — Grounded in Your Notes
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeSession.concept}
                </p>
              </div>

              {/* 03. Worked Example */}
              <div className="pt-6 border-t border-purple-500/15 space-y-2">
                <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  03. Worked Example
                </h3>
                <div className="p-4 bg-[#090b1c] border border-purple-500/20 rounded-2xl text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {activeSession.example}
                </div>
              </div>

              {/* 04 & 05: Exam Points & Mistakes */}
              <div className="pt-6 border-t border-purple-500/15 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-emerald-400 font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    04. Important Points for Exams
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    {activeSession.important_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                        <span className="font-mono text-emerald-400 font-semibold">0{i + 1}.</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-amber-400 font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    05. Common Student Mistakes
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    {activeSession.common_mistakes.map((mk, i) => (
                      <li key={i} className="flex items-start gap-2 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                        <span className="font-mono text-amber-400 font-semibold">▲</span>
                        <span>{mk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 06. Quick Check Interactive Diagnostic */}
              <div className="pt-6 border-t border-purple-500/15 space-y-3">
                <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  06. Quick Check — Test Your Understanding
                </h3>
                <p className="text-sm font-medium text-white">
                  {activeSession.quick_check.question}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {activeSession.quick_check.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === activeSession.quick_check.correct_index;
                    let btnStyle = "border-purple-500/20 hover:border-purple-400/50 glass-panel text-slate-200";
                    if (selectedOption !== null) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500/60 bg-emerald-950/50 text-emerald-200 font-medium";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "border-red-500/60 bg-red-950/50 text-red-200";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        disabled={selectedOption !== null}
                        className={`p-3 text-xs text-left rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedOption !== null && isCorrect && (
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">✓ CORRECT</span>
                        )}
                        {selectedOption !== null && isSelected && !isCorrect && (
                          <span className="text-red-400 font-mono text-[11px] font-bold">✕ INCORRECT</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-[#090b1c] border border-purple-500/20 text-xs text-slate-300 space-y-1 font-mono"
                  >
                    <div className="font-semibold text-violet-300">Explanation:</div>
                    <p className="leading-relaxed">{activeSession.quick_check.explanation}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Previous Lessons Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white font-display">Lesson History</h3>
              {sessions.length === 0 ? (
                <div className="text-xs text-slate-400 font-mono">No lessons completed yet.</div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSession(s);
                        setSelectedOption(null);
                      }}
                      className={`w-full p-3 text-left rounded-xl text-xs transition-all cursor-pointer ${
                        activeSession.id === s.id
                          ? "bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30"
                          : "glass-panel text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="truncate">{s.topic}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 text-center text-xs text-slate-400 font-mono border border-purple-500/20">
          Enter any syllabus theorem, algorithm, or concept above to generate your 6-stage grounded lesson.
        </div>
      )}
    </div>
  );
};
