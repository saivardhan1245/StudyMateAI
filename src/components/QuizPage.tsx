import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, CheckCircle2, ChevronRight, Award, AlertCircle } from "lucide-react";
import { AppPage, DocumentItem, QuizItem } from "../types";

interface QuizPageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ token, onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [topicFocus, setTopicFocus] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [docRes, qzRes] = await Promise.all([
          fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/quizzes", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const docData = await docRes.json();
        const qzData = await qzRes.json();
        if (docRes.ok) setDocuments(docData.documents || []);
        if (qzRes.ok) {
          const list = qzData.quizzes || [];
          setQuizzes(list);
          if (list.length > 0) setActiveQuiz(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;
    setError(null);
    setGenerating(true);
    setAnswers({});

    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic_focus: topicFocus.trim() || undefined,
          question_count: questionCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to generate quiz.");
      setQuizzes((prev) => [data.quiz, ...prev]);
      setActiveQuiz(data.quiz);
      setTopicFocus("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    if (activeQuiz?.submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || activeQuiz.submitted || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_answers: answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quiz.");
      setActiveQuiz(data.quiz);
      setQuizzes((prev) => prev.map((q) => (q.id === data.quiz.id ? data.quiz : q)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-violet-400 py-8 font-mono">Loading Quiz generator...</div>;
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
          Upload your lecture PDFs before generating a quiz.
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          StudyMate AI creates diagnostic multiple-choice questions strictly from your uploaded files, complete with page citations and explanation keys.
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
          Diagnostic Lecture Quizzes
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Auto-graded Multiple Choice Questions with Verbatim Citations & Weak-Topic Detection
        </p>
      </motion.div>

      {/* Generator Bar (Stagger 2) */}
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        onSubmit={handleGenerateQuiz}
        className="glass-panel-glow border border-purple-500/25 rounded-3xl p-6 space-y-4 shadow-xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Topic Focus (Optional — leave blank to test across all uploaded notes)
            </label>
            <input
              type="text"
              value={topicFocus}
              onChange={(e) => setTopicFocus(e.target.value)}
              placeholder="e.g., Page Replacement, TLB & EAT, or Demand Paging"
              className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
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
              {generating ? "Generating from PDFs..." : "Generate New Quiz"}
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300">
            ▲ {error}
          </div>
        )}
      </motion.form>

      {activeQuiz ? (
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
              className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/25 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/15 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    {activeQuiz.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {activeQuiz.questions.length} Questions · Focus: {activeQuiz.topic_focus}
                  </p>
                </div>

                {activeQuiz.submitted && (
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xl font-bold text-emerald-400">
                      Score: {activeQuiz.score}/{activeQuiz.total} ({activeQuiz.percentage}%)
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeQuiz.weak_topics_identified?.length === 0
                        ? "● Nominal Topic Mastery"
                        : `▲ ${activeQuiz.weak_topics_identified?.length} weak topic(s) logged`}
                    </div>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-7">
                {activeQuiz.questions.map((q, qIdx) => {
                  const chosen = activeQuiz.submitted
                    ? activeQuiz.user_answers?.[qIdx]
                    : answers[qIdx];

                  return (
                    <div key={q.id} className="pb-6 border-b border-purple-500/15 last:border-b-0 space-y-3">
                      <div className="flex items-center justify-between text-xs text-violet-400 font-mono">
                        <span>Question 0{qIdx + 1}</span>
                        <span>Topic: {q.topic}</span>
                      </div>

                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isChosen = chosen === oIdx;
                          const isCorrect = oIdx === q.correct_index;

                          let cls = "border-purple-500/20 hover:border-purple-400/50 glass-panel text-slate-200";
                          if (activeQuiz.submitted) {
                            if (isCorrect) {
                              cls = "border-emerald-500/60 bg-emerald-950/50 text-emerald-200 font-medium";
                            } else if (isChosen && !isCorrect) {
                              cls = "border-red-500/60 bg-red-950/50 text-red-200";
                            }
                          } else if (isChosen) {
                            cls = "border-violet-500 bg-violet-950/60 text-white font-medium shadow-md shadow-violet-600/20";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(qIdx, oIdx)}
                              className={`p-3 text-xs text-left rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${cls}`}
                            >
                              <span>{opt}</span>
                              {activeQuiz.submitted && isCorrect && (
                                <span className="text-emerald-400 font-mono text-[11px] font-bold">✓ CORRECT</span>
                              )}
                              {activeQuiz.submitted && isChosen && !isCorrect && (
                                <span className="text-red-400 font-mono text-[11px] font-bold">✕ MISSED</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {activeQuiz.submitted && (
                        <div className="mt-3 p-3.5 bg-[#090b1c] border border-purple-500/20 rounded-xl space-y-1 text-xs text-slate-300 font-mono">
                          <div className="flex items-center justify-between text-[11px] text-violet-400">
                            <span>Remediation Reference:</span>
                            <span>
                              {q.source_filename} (p. {q.source_page})
                            </span>
                          </div>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!activeQuiz.submitted && (
                <div className="pt-4 border-t border-purple-500/15 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={submitting || Object.keys(answers).length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    {submitting ? "Grading & Updating Telemetry..." : "Submit Answers for Evaluation"}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Previous Quizzes List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white font-display">Completed Quizzes</h3>
              {quizzes.length === 0 ? (
                <div className="text-xs text-slate-400 font-mono">No quizzes generated yet.</div>
              ) : (
                <div className="space-y-2">
                  {quizzes.map((qz) => (
                    <button
                      key={qz.id}
                      type="button"
                      onClick={() => setActiveQuiz(qz)}
                      className={`w-full p-3 text-left rounded-xl text-xs transition-all cursor-pointer ${
                        activeQuiz.id === qz.id
                          ? "bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30"
                          : "glass-panel text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="truncate font-medium">{qz.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {qz.submitted ? `Score: ${qz.percentage}%` : "In Progress"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 text-center text-xs text-slate-400 font-mono border border-purple-500/20">
          Click "Generate New Quiz" above to create multiple-choice questions from your indexed slides.
        </div>
      )}
    </div>
  );
};
