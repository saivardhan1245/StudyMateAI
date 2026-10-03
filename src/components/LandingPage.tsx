import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  MessageSquare,
  GraduationCap,
  CheckCircle2,
  BarChart2,
  Calendar,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { AppPage, User } from "../types";
import { HeroVisualPipeline } from "./HeroVisualPipeline";
import { useCardExpansion, CardMeta } from "../context/CardExpansionContext";

interface LandingPageProps {
  onAuthSuccess: (token: string, user: User) => void;
  onExploreFeature?: (feature: AppPage, rect: DOMRect) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const sectionSpatialVariants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    rotateX: 4,
    y: 40,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess, onExploreFeature }) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const { phase, triggerCardExpansion } = useCardExpansion();
  const isCardOpening = phase === "expanding" || phase === "expanded";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        authMode === "register"
          ? { name, email, password, institution, major }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setError(null);
    setShowAuthModal(true);
  };

  const handleCardClick = (
    id: AppPage,
    e: React.MouseEvent<HTMLDivElement>,
    meta: CardMeta
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerCardExpansion(id, rect, meta, "landing");
    if (onExploreFeature) {
      onExploreFeature(id, rect);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060814] text-slate-100 selection:bg-purple-500 selection:text-white font-sans relative overflow-x-hidden perspective-1200">
      {/* ATMOSPHERIC BACKGROUND GRID & AMBIENT VIGNETTES */}
      <div className="fixed inset-0 bg-tech-grid pointer-events-none opacity-40 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-radial-vignette pointer-events-none z-0" />
      <div className="fixed -bottom-40 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* 3D Interactive Stage: Pushes away when a feature card expands */}
      <motion.div
        animate={
          isCardOpening
            ? {
                scale: 0.92,
                y: 18,
                rotateX: 3.5,
                filter: "blur(4px) brightness(0.45)",
                opacity: 0.25,
              }
            : {
                scale: 1,
                y: 0,
                rotateX: 0,
                filter: "blur(0px) brightness(1)",
                opacity: 1,
              }
        }
        transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col preserve-3d"
      >

      {/* DARK TRANSPARENT / STICKY NAVBAR */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#060814]/90 backdrop-blur-md border-b border-purple-500/20 py-3 shadow-xl shadow-black/40"
            : "bg-transparent border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-2.5 group cursor-pointer"
          >
            <motion.span
              animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(168,85,247,0.8)] inline-block"
            />
            <span className="group-hover:text-violet-300 transition-colors">StudyMate AI</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#how-it-works" className="hover:text-violet-400 transition-colors whitespace-nowrap">
              How it works
            </a>
            <a href="#features" className="hover:text-violet-400 transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="#rescue" className="hover:text-violet-400 transition-colors whitespace-nowrap">
              Last-Minute Rescue
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => openAuth("login")}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => openAuth("register")}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-md shadow-violet-600/30 border border-violet-400/30"
            >
              Get Started →
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2-COLUMN CINEMATIC HERO SECTION */}
      <section id="top" className="relative z-10 pt-16 pb-16 lg:pt-24 lg:pb-24 px-6 lg:px-8 border-b border-purple-500/15 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Editorial Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wide text-violet-300 bg-violet-950/60 border border-violet-500/30 rounded-full font-mono shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span>StudyMate AI</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] font-display"
            >
              Your notes. Your tutor. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 relative inline-block">
                Your next breakthrough.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal"
            >
              Upload your lecture PDFs. Learn, practice, and know what to revise next.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => openAuth("register")}
                className="px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-violet-600/35 border border-violet-400/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started with StudyMate</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => openAuth("login")}
                className="px-6 py-3.5 text-sm font-medium text-slate-300 hover:text-white glass-panel rounded-xl transition-all cursor-pointer text-center"
              >
                Open Workspace
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="pt-4 flex items-center gap-4 text-xs font-mono text-slate-400"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Your Notes</span>
              </div>
              <span>·</span>
              <div>Your Tutor</div>
              <span>·</span>
              <div>Your Private Study Space</div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Cinematic Pipeline Orbital Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <HeroVisualPipeline />
          </motion.div>
        </div>
      </section>

      {/* 5. FROM NOTES TO MASTERY: HORIZONTAL CONTINUOUS STORYTELLING JOURNEY */}
      <section id="how-it-works" className="relative z-10 py-20 lg:py-24 max-w-6xl mx-auto px-6 lg:px-8 border-b border-purple-500/15">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-2"
        >
          <div className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-widest">
            Continuous Academic Journey
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
            From Notes to Exam Mastery
          </h2>
          <p className="text-sm text-slate-400">
            Four cohesive stages turning raw slides into confident, cited exam excellence.
          </p>
        </motion.div>

        {/* Continuous Horizontal Timeline Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Subtle Glowing Connection Line */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-[2px] bg-gradient-to-r from-violet-600/40 via-fuchsia-600/50 to-emerald-600/40 pointer-events-none z-0" />

          {/* Step 1: Upload */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="glass-panel-glow p-6 rounded-2xl relative z-10 space-y-4 hover:border-violet-400/60 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 font-mono font-bold text-sm flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              01
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Upload Your Notes</h3>
              <div className="text-[11px] font-mono text-violet-400 mt-0.5">Upload Your Notes</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Drop lecture slides or textbook chapters. Organized and prepared for rapid study sessions.
            </p>
          </motion.div>

          {/* Step 2: Learn */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="glass-panel-glow p-6 rounded-2xl relative z-10 space-y-4 hover:border-fuchsia-400/60 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 font-mono font-bold text-sm flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              02
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Learn Step by Step</h3>
              <div className="text-[11px] font-mono text-fuchsia-400 mt-0.5">Learn Step by Step</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask 2, 5, or 10-mark exam questions. Break down hard theorems into intuition & examples.
            </p>
          </motion.div>

          {/* Step 3: Practice */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="glass-panel-glow p-6 rounded-2xl relative z-10 space-y-4 hover:border-indigo-400/60 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              03
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Practice & Test Yourself</h3>
              <div className="text-[11px] font-mono text-indigo-400 mt-0.5">Practice & Test Yourself</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Take auto-graded diagnostic quizzes with precise page citations for every correct answer.
            </p>
          </motion.div>

          {/* Step 4: Master */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="glass-panel-glow p-6 rounded-2xl relative z-10 space-y-4 hover:border-emerald-400/60 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              04
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Find What to Revise</h3>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">Find What to Revise</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target diagnosed knowledge gaps with prioritized schedules and 15-min cram sheets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 6. ASYMMETRIC EDITORIAL FEATURE COMPOSITION WITH CARD EXPANSION HOOK */}
      <section id="features" className="relative z-10 py-20 lg:py-24 max-w-6xl mx-auto px-6 lg:px-8 border-b border-purple-500/15">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-2"
        >
          <div className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-widest">
            Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
            Built for Serious University Study
          </h2>
          <p className="text-sm text-slate-400">
            Click any feature card to trigger the spatial card-to-page expansion into your workspace.
          </p>
        </motion.div>

        {/* Asymmetric Grid: DOMINANT (Span 2) + SECONDARY + PROGRESSION + SIGNATURE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* DOMINANT: Study Chat (Col span 2 on md) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.008 }}
            transition={{ duration: 0.2 }}
            onClick={(e) =>
              handleCardClick("chat", e, {
                title: "Study Chat",
                subtitle: "Direct answers with exact textbook page citations",
                badge: "Study Chat",
                color: "violet",
              })
            }
            className="md:col-span-2 glass-panel p-8 rounded-3xl cursor-pointer relative overflow-hidden border border-violet-500/30 hover:border-violet-400 transition-all group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between pb-6 border-b border-purple-500/15">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-400/40 text-violet-300 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Study Chat</h3>
                  <div className="text-xs font-mono text-violet-400">Study Chat</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-400 group-hover:text-violet-300 transition-colors">
                <span>Expand</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-xl">
              Ask questions directly from your uploaded slides. Choose between Quick mode, university 2-mark definitions, 5-mark mechanisms, or 10-mark long-essay breakdowns. Every answer retains exact page provenance.
            </p>

            {/* Embedded Mini UI Preview */}
            <div className="mt-6 p-4 rounded-xl bg-[#090b1c]/80 border border-purple-500/20 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="text-violet-400">Q: "Explain virtual memory decoupling..."</span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">Cited: Lecture10.pdf (p.1)</span>
            </div>
          </motion.div>

          {/* SECONDARY 1: Teach Me */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={(e) =>
              handleCardClick("teach", e, {
                title: "Teach Me",
                subtitle: "Step-by-step conceptual pedagogy & self-check",
                badge: "Learn Step by Step",
                color: "fuchsia",
              })
            }
            className="glass-panel p-7 rounded-3xl cursor-pointer relative overflow-hidden border border-fuchsia-500/30 hover:border-fuchsia-400 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Teach Me</h3>
            <div className="text-xs font-mono text-fuchsia-400 mt-0.5">Learn Step by Step</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Step-by-step conceptual pedagogy: Intuition, Concept, Worked Example, Exam Points, Common Mistakes, and Quick Check.
            </p>
          </motion.div>

          {/* SECONDARY 2: Quiz */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={(e) =>
              handleCardClick("quiz", e, {
                title: "Diagnostic Quiz",
                subtitle: "Course-grounded multiple choice practice",
                badge: "Practice & Test Yourself",
                color: "indigo",
              })
            }
            className="glass-panel p-7 rounded-3xl cursor-pointer relative overflow-hidden border border-indigo-500/30 hover:border-indigo-400 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Diagnostic Quiz</h3>
            <div className="text-xs font-mono text-indigo-400 mt-0.5">Practice & Test Yourself</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Multiple-choice questions generated strictly from your syllabus. Auto-graded with verbatim citations and explanation keys.
            </p>
          </motion.div>

          {/* PROGRESSION 1: Knowledge Gaps */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={(e) =>
              handleCardClick("progress", e, {
                title: "Knowledge Gaps",
                subtitle: "Real accuracy telemetry and weak topic diagnosis",
                badge: "Know Your Weak Spots",
                color: "purple",
              })
            }
            className="glass-panel p-7 rounded-3xl cursor-pointer relative overflow-hidden border border-purple-500/30 hover:border-purple-400 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Knowledge Gaps</h3>
            <div className="text-xs font-mono text-purple-400 mt-0.5">Know Your Weak Spots</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Real telemetry tracking topics below 80% accuracy, highlighting missed questions and exact pages needing re-reading.
            </p>
          </motion.div>

          {/* PROGRESSION 2: Study Plan */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={(e) =>
              handleCardClick("plan", e, {
                title: "Study Plan",
                subtitle: "Prioritized daily calendar targeted at weaknesses",
                badge: "Build Your Study Plan",
                color: "purple",
              })
            }
            className="glass-panel p-7 rounded-3xl cursor-pointer relative overflow-hidden border border-purple-500/30 hover:border-purple-400 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Study Plan</h3>
            <div className="text-xs font-mono text-purple-400 mt-0.5">Build Your Study Plan</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Day-by-day revision scheduling prioritizing identified weak topics so you spend study hours where points are won.
            </p>
          </motion.div>

          {/* SIGNATURE FEATURE: Last-Minute Rescue (Full width or highlight) */}
          <motion.div
            id="rescue"
            whileHover={{ y: -4, scale: 1.008 }}
            transition={{ duration: 0.2 }}
            onClick={(e) =>
              handleCardClick("rescue", e, {
                title: "Last-Minute Rescue Sheet",
                subtitle: "15-minute high yield formulas, definitions and traps",
                badge: "Last-Minute Rescue",
                color: "violet",
              })
            }
            className="md:col-span-3 glass-panel-glow p-8 rounded-3xl cursor-pointer relative overflow-hidden border-2 border-violet-500/40 hover:border-violet-400 transition-all shadow-xl shadow-purple-950/40 group"
          >
            <div className="absolute -top-12 -right-12 w-96 h-96 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-700/50">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-mono text-violet-300 font-semibold tracking-wider">
                    Last-Minute Rescue
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                    Last-Minute Rescue Sheet
                  </h3>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-violet-900/60 border border-violet-500/40 text-xs font-mono text-violet-200">
                Your Most Important Revision
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-3xl">
              Distills your notes into core definitions, must-know formulas, likely exam questions with mark rubrics, and rapid traps to avoid—strictly grounded in your course slides.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TECHNICAL SPECIFICATIONS & ARCHITECTURE */}
      <section className="relative z-10 py-20 max-w-5xl mx-auto px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto space-y-2"
        >
          <div className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-widest">
            Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            How StudyMate Helps You Learn
          </h2>
          <p className="text-xs text-slate-400">
            Strictly answers from your uploaded course slides and textbook chapters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-300">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl space-y-3"
          >
            <h3 className="font-semibold text-white text-sm font-display">
              Your Notes Become Your Study Guide
            </h3>
            <p className="leading-relaxed text-slate-400">
              When a lecture PDF is uploaded, text is extracted page by page, validated with header checks, and sliced into overlapping semantic chunks. Each chunk receives a dense vector embedding and BM25 indexing for fast, high-accuracy cosine retrieval.
            </p>
            <div className="text-[11px] font-mono text-violet-400">
              FAISS FlatIP · Dense Embeddings · BM25
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl space-y-3"
          >
            <h3 className="font-semibold text-white text-sm font-display">
              Answers From Your Own Notes
            </h3>
            <p className="leading-relaxed text-slate-400">
              Retrieved chunks are passed as authoritative context to Gemma. Every answer cites the source document and page number. If a concept is not present in your uploaded notes, StudyMate AI clearly flags it instead of guessing or inventing answers.
            </p>
            <div className="text-[11px] font-mono text-violet-400">
              Gemma Open-Weight Model · Grounded Citations
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8 space-y-4">
          <h3 className="text-xl font-bold text-white font-display">
            Start studying with your own course materials
          </h3>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => openAuth("register")}
            className="px-8 py-3.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/30 border border-violet-400/40"
          >
            Enter StudyMate AI Workspace →
          </motion.button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-purple-500/15 bg-[#050611] py-8 px-8 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>STUDYMATE AI — Academic Lecture RAG & Study Assistant</span>
          <span>Your notes · Your tutor · Your next breakthrough</span>
        </div>
      </footer>
      </motion.div>

      {/* AUTHENTICATION MODAL WITH CINEMATIC SCALE */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-[#060814]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="glass-panel-glow border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-purple-500/20">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {authMode === "register" ? "Create Student Account" : "Sign In to Workspace"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authMode === "register"
                      ? "Start with a clean, private workspace"
                      : "Access your indexed lecture PDFs"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-purple-950/40 border border-purple-500/20 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode("register"); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authMode === "register" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authMode === "login" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300 font-medium">
                  ▲ Error: {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex Johnson"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                {authMode === "register" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        University
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g., University"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Major
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g., Computer Science"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-600/30"
                >
                  <span>
                    {loading
                      ? "Authenticating..."
                      : authMode === "register"
                      ? "Create Account & Enter Workspace"
                      : "Sign In"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
