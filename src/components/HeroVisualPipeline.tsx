import React from "react";
import { motion } from "motion/react";
import { FileText, Cpu, BookOpen, CheckCircle, Award } from "lucide-react";

export const HeroVisualPipeline: React.FC = () => {
  return (
    <div className="relative w-full aspect-square max-w-[480px] mx-auto flex items-center justify-center select-none">
      {/* Deep Atmospheric Glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 via-fuchsia-600/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute w-72 h-72 rounded-full border border-violet-500/20 animate-spin-slow pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full border border-purple-500/10 pointer-events-none" />

      {/* Floating Orbital Node: 01 PDF DOCUMENTS */}
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-4 left-6 z-20"
      >
        <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-950/50 border border-violet-500/30">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Step 01</div>
            <div className="text-xs font-semibold text-white">Your Course Notes</div>
          </div>
        </div>
      </motion.div>

      {/* Floating Orbital Node: 02 KNOWLEDGE EXTRACTION */}
      <motion.div
        animate={{ y: [0, 8, 0], x: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
        className="absolute top-12 right-4 z-20"
      >
        <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-950/50 border border-fuchsia-500/30">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-wider">Step 02</div>
            <div className="text-xs font-semibold text-white">Key Concepts</div>
          </div>
        </div>
      </motion.div>

      {/* Center Core: AI TUTOR ENGINE (Gemma) */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative z-30"
      >
        <div className="w-36 h-36 rounded-3xl glass-panel-glow flex flex-col items-center justify-center p-4 text-center border-2 border-violet-400/50 shadow-[0_0_50px_rgba(168,85,247,0.35)] relative overflow-hidden group">
          {/* Animated scanline */}
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-300 to-transparent opacity-60"
          />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white mb-2 shadow-md shadow-violet-700/50">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white font-display">Personal Tutor</span>
          <span className="text-[9px] font-mono text-violet-300">Your Own Material</span>
        </div>
      </motion.div>

      {/* Floating Orbital Node: 03 PRACTICE QUIZZES */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-12 left-4 z-20"
      >
        <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-950/50 border border-indigo-500/30">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Step 03</div>
            <div className="text-xs font-semibold text-white">Practice Quizzes</div>
          </div>
        </div>
      </motion.div>

      {/* Floating Orbital Node: 04 MASTERY & RESCUE */}
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-6 right-6 z-20"
      >
        <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-950/50 border border-emerald-500/30">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Step 04</div>
            <div className="text-xs font-semibold text-white">Confident Revision</div>
          </div>
        </div>
      </motion.div>

      {/* Connecting Laser Beams (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 stroke-violet-500/30 stroke-dasharray-4">
        <line x1="25%" y1="20%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="75%" y1="22%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="25%" y1="78%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="75%" y1="80%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    </div>
  );
};
