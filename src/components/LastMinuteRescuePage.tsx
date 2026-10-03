import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Zap, Clock, ShieldAlert, Sparkles, BookOpen, AlertTriangle } from "lucide-react";
import { AppPage, DocumentItem, RescueSheetItem } from "../types";

interface LastMinuteRescuePageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

const sectionReveal = {
  hidden: { opacity: 0, y: 15 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export const LastMinuteRescuePage: React.FC<LastMinuteRescuePageProps> = ({ token, onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sheets, setSheets] = useState<RescueSheetItem[]>([]);
  const [activeSheet, setActiveSheet] = useState<RescueSheetItem | null>(null);
  const [focusQuery, setFocusQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [docRes, rescueRes] = await Promise.all([
          fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/rescue", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const docData = await docRes.json();
        const rescueData = await rescueRes.json();
        if (docRes.ok) setDocuments(docData.documents || []);
        if (rescueRes.ok) {
          const list = rescueData.sheets || [];
          setSheets(list);
          if (list.length > 0) setActiveSheet(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleGenerateRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;
    setError(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/rescue/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ focus_query: focusQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to generate rescue sheet.");
      setSheets((prev) => [data.sheet, ...prev]);
      setActiveSheet(data.sheet);
      setFocusQuery("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-violet-400 py-8 font-mono">Loading Last-Minute Rescue synthesizer...</div>;
  }

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-glow border border-purple-500/30 rounded-3xl p-8 lg:p-10 space-y-4 shadow-xl"
      >
        <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
          ▲ NO LECTURE DOCUMENTS UPLOADED
        </div>
        <h1 className="text-2xl font-bold text-white font-display">
          Upload your lecture PDFs before generating a Last-Minute Rescue sheet.
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Last-Minute Rescue distills your uploaded course notes into high-yield definitions, core formulas, likely exam questions with mark weights, and rapid pitfalls—each citing its exact page number.
        </p>
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
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Signature Urgency Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170e3b] via-[#0e112b] to-[#12082b] text-white p-7 sm:p-9 shadow-2xl border border-violet-500/35"
      >
        {/* Subtle geometric radar pulse accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 text-violet-300 font-mono text-[11px] font-semibold border border-violet-500/30 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>HIGH-URGENCY 15-MINUTE REVISION PROTOCOL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-white">
              Last-Minute Exam Rescue Sheet
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Rapid pre-exam synthesis of high-yield definitions, formulas, likely exam questions, and traps strictly from your indexed lecture slides.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-purple-950/60 border border-purple-500/30 rounded-2xl px-4 py-3 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 text-violet-300" />
            <span className="text-violet-200">Grounded in {documents.length} Course PDF(s)</span>
          </div>
        </div>
      </motion.div>

      {/* Synthesis Form */}
      <form onSubmit={handleGenerateRescue} className="glass-panel-glow border border-purple-500/25 rounded-3xl p-6 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={focusQuery}
            onChange={(e) => setFocusQuery(e.target.value)}
            placeholder="Optional focus (e.g., Virtual Memory, TLB Formulas & Page Replacement) — leave blank for all notes"
            disabled={generating}
            className="flex-1 px-4 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${generating ? "animate-pulse" : ""}`} />
            <span>{generating ? "Synthesizing Cram Sheet..." : "Synthesize Rescue Sheet"}</span>
          </motion.button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300 font-mono">
            ▲ {error}
          </div>
        )}
      </form>

      {/* Generated Sheet Display with Expanding Panels */}
      {activeSheet ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-7 border border-purple-500/25 shadow-2xl">
            <div className="pb-4 border-b border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono text-violet-400 font-semibold tracking-wider">
                  HIGH-YIELD EXAM CRAM SHEET
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 font-display">
                  {activeSheet.title}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-purple-950/60 rounded-xl px-3 py-1 border border-purple-500/20">
                {activeSheet.sources.length} chunks referenced
              </span>
            </div>

            {/* 01. High-Yield Definitions */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={sectionReveal} className="space-y-3">
              <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                01. High-Yield Definitions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSheet.high_yield_definitions.map((def, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-2xl space-y-1.5 bg-[#090b1c] border border-purple-500/20 hover:border-violet-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{def.term}</span>
                      <span className="text-[11px] font-mono text-violet-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                        {def.source_ref}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{def.definition}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 02. Core Formulas & Rules */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={sectionReveal} className="pt-6 border-t border-purple-500/15 space-y-3">
              <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                02. Core Formulas & Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSheet.core_formulas_or_rules.map((f, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className="p-4 bg-[#090b1c] border border-purple-500/20 rounded-2xl space-y-2 hover:border-violet-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{f.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{f.source_ref}</span>
                    </div>
                    <div className="text-xs font-mono text-violet-300 bg-purple-950/50 p-2.5 rounded-xl border border-purple-500/30 font-semibold shadow-sm">
                      {f.expression_or_rule}
                    </div>
                    <p className="text-xs text-slate-300">{f.when_to_use}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 03. Likely Exam Questions & Rubric */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={sectionReveal} className="pt-6 border-t border-purple-500/15 space-y-3">
              <h3 className="text-sm font-bold text-violet-300 font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                03. Likely Exam Questions & Rubric Checklist
              </h3>
              <div className="space-y-3">
                {activeSheet.likely_exam_questions.map((eq, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 2 }}
                    className="p-4 border border-purple-500/20 rounded-2xl space-y-2 bg-[#090b1c] hover:border-purple-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{eq.question}</span>
                      <span className="text-xs font-mono text-violet-400 bg-purple-950/60 border border-purple-500/30 rounded px-2 py-0.5 whitespace-nowrap">
                        {eq.mark_weight} · {eq.source_ref}
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300 pl-2">
                      {eq.key_points_to_hit.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 04. Last-Minute Exam Traps */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={sectionReveal} className="pt-6 border-t border-purple-500/15 space-y-2">
              <h3 className="text-sm font-bold text-amber-400 font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                04. Last-Minute Exam Traps to Avoid
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeSheet.rapid_pitfalls.map((pit, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/25">
                    <span className="font-mono text-amber-400 font-bold shrink-0">▲</span>
                    <span>{pit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 text-center text-xs text-slate-400 font-mono border border-purple-500/20">
          Click "Synthesize Rescue Sheet" above to generate a high-yield cram sheet from your uploaded lecture PDFs.
        </div>
      )}
    </div>
  );
};
