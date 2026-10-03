import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AppPage, QuizItem } from "../types";

interface ProgressPageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

interface TopicMasteryItem {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  status: "Mastered" | "Needs Review" | "Knowledge Gap";
  missed_questions: Array<{
    question: string;
    source_filename: string;
    source_page: number;
  }>;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ token, onNavigate }) => {
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizItem[]>([]);
  const [topicMastery, setTopicMastery] = useState<TopicMasteryItem[]>([]);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setCompletedQuizzes(data.completed_quizzes || []);
          setTopicMastery(data.topic_mastery || []);
          setTotalAnswered(data.total_questions_answered || 0);
          setTotalCorrect(data.total_correct || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [token]);

  if (loading) {
    return <div className="text-xs text-violet-400 py-8 font-mono">Loading Progress & Mastery analytics...</div>;
  }

  if (completedQuizzes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel-glow border border-purple-500/30 rounded-3xl p-8 lg:p-10 space-y-4 shadow-xl"
      >
        <div className="text-xs font-mono text-violet-400 font-semibold tracking-wider">
          ● NO COMPLETED QUIZZES YET
        </div>
        <h1 className="text-2xl font-bold text-white font-display">
          Your Progress & Knowledge Gap tracker is waiting for your first quiz.
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          StudyMate AI never invents fake mastery scores or placeholder knowledge gaps. Complete at least one grounded quiz from your uploaded lecture PDFs to populate topic-by-topic accuracy, missed questions, and page-level remediation references.
        </p>
        <div className="pt-2 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onNavigate("quiz")}
            className="px-5 py-3 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 cursor-pointer"
          >
            Go to Quiz Generator →
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const overallAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-purple-500/15">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Progress & Knowledge Gap Diagnosis
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Computed exclusively from your {completedQuizzes.length} completed grounded quiz(zes)
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onNavigate("plan")}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-md shadow-violet-600/30 border border-violet-400/30"
        >
          Build Study Plan for Weak Topics →
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -3 }}
          className="glass-panel rounded-2xl p-5 border border-purple-500/20 shadow-xs transition-shadow"
        >
          <div className="text-xs font-mono text-slate-400">Overall Quiz Accuracy</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            {totalCorrect} correct of {totalAnswered} questions
          </div>
          {/* Animated Mini Progress Bar */}
          <div className="w-full bg-[#090b1c] rounded-full h-1.5 mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallAccuracy}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -3 }}
          className="glass-panel rounded-2xl p-5 border border-purple-500/20 shadow-xs transition-shadow"
        >
          <div className="text-xs font-mono text-slate-400">Topics Assessed</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {topicMastery.length}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            {topicMastery.filter((t) => t.status === "Mastered").length} mastered (≥80%)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -3 }}
          className="glass-panel rounded-2xl p-5 border border-purple-500/20 shadow-xs transition-shadow"
        >
          <div className="text-xs font-mono text-slate-400">Identified Knowledge Gaps</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono tabular-nums">
            {topicMastery.filter((t) => t.status !== "Mastered").length}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
            Topics below 80% accuracy
          </div>
        </motion.div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-purple-500/25">
        <div className="px-6 py-4 border-b border-purple-500/15">
          <h2 className="text-base font-bold text-white font-display">
            Topic Mastery & Source Page Remediation
          </h2>
        </div>

        <div className="divide-y divide-purple-500/15">
          {topicMastery.map((item, index) => (
            <motion.div
              key={item.topic}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              className="p-6 space-y-3 hover:bg-purple-950/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">{item.topic}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {item.correct} / {item.total} Correct · {item.accuracy}% Accuracy
                  </div>
                </div>

                <div className="text-xs font-mono">
                  {item.status === "Mastered" && (
                    <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">● MASTERED ({item.accuracy}%)</span>
                  )}
                  {item.status === "Needs Review" && (
                    <span className="text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">▲ NEEDS REVIEW ({item.accuracy}%)</span>
                  )}
                  {item.status === "Knowledge Gap" && (
                    <span className="text-red-400 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">✕ KNOWLEDGE GAP ({item.accuracy}%)</span>
                  )}
                </div>
              </div>

              {/* Viewport Animated Progress Bar */}
              <div className="w-full bg-[#090b1c] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.accuracy}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className={`h-full rounded-full ${
                    item.status === "Mastered"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : item.status === "Needs Review"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-red-500 to-rose-400"
                  }`}
                />
              </div>

              {item.missed_questions && item.missed_questions.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Remediation Citations from Missed Questions:
                  </div>
                  <div className="space-y-1.5">
                    {item.missed_questions.map((mq, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#090b1c] border border-purple-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-slate-200">{mq.question}</span>
                        <span className="font-mono text-violet-400 bg-purple-950/50 border border-purple-500/30 rounded px-2 py-0.5 whitespace-nowrap">
                          Re-read: {mq.source_filename} · Page {mq.source_page}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
