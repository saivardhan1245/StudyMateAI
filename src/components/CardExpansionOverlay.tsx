import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useCardExpansion } from "../context/CardExpansionContext";

export const CardExpansionOverlay: React.FC = () => {
  const {
    expandingCardId,
    cardRect,
    phase,
    sourceContext,
    triggerCardCollapse,
    clearCardExpansion,
  } = useCardExpansion();

  const [animatingPhase, setAnimatingPhase] = useState<"expanding" | "collapsing" | null>(null);

  useEffect(() => {
    if (phase === "expanding") {
      setAnimatingPhase("expanding");
    } else if (phase === "collapsing") {
      setAnimatingPhase("collapsing");
    }
  }, [phase]);

  if (!expandingCardId || !cardRect) return null;

  const meta = cardRect.meta;

  return (
    <>
      {/* 1. Spatial Backdrop: Darkens & Blurs Surrounding Interface */}
      <AnimatePresence>
        {(animatingPhase === "expanding" || phase === "expanded" || animatingPhase === "collapsing") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: animatingPhase === "collapsing" ? 0 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#060814]/85 backdrop-blur-md z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 2. Floating Top-Left Return Control when card is fully expanded */}
      <AnimatePresence>
        {(phase === "expanded" || animatingPhase === "collapsing") && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.92 }}
            animate={{
              opacity: animatingPhase === "collapsing" ? 0 : 1,
              y: animatingPhase === "collapsing" ? -25 : 0,
              scale: animatingPhase === "collapsing" ? 0.92 : 1,
            }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 left-6 z-50 flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04, x: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={triggerCardCollapse}
              className="px-4 py-2 bg-[#0d0f28]/95 border border-violet-500/40 hover:border-violet-300 text-white text-xs font-semibold rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-2 cursor-pointer transition-all shadow-purple-950/50"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-violet-400" />
              <span>
                {sourceContext === "landing" ? "← Back to Overview" : "← Back to Dashboard"}
              </span>
            </motion.button>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-950/70 border border-violet-500/30 text-[11px] font-mono text-violet-300 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span>Expanded: {meta?.title || expandingCardId}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Physical 3D Morphing Card Portal */}
      <AnimatePresence>
        {(animatingPhase === "expanding" || animatingPhase === "collapsing") && (
          <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden perspective-1200">
            <motion.div
              initial={
                animatingPhase === "expanding"
                  ? {
                      top: cardRect.top,
                      left: cardRect.left,
                      width: cardRect.width,
                      height: cardRect.height,
                      borderRadius: "24px",
                      borderColor: "rgba(168, 85, 247, 0.8)",
                      borderWidth: "2px",
                      boxShadow: "0 0 50px rgba(168, 85, 247, 0.7), 0 25px 60px -10px rgba(0,0,0,0.9)",
                      scale: 1.05,
                      rotateX: -2,
                      rotateY: 2.5,
                      rotateZ: -0.8,
                      opacity: 1,
                    }
                  : {
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      borderRadius: "0px",
                      borderColor: "rgba(168, 85, 247, 0.3)",
                      borderWidth: "1px",
                      boxShadow: "0 0 80px rgba(168, 85, 247, 0.3)",
                      scale: 1,
                      rotateX: 0,
                      rotateY: 0,
                      rotateZ: 0,
                      opacity: 1,
                    }
              }
              animate={
                animatingPhase === "expanding"
                  ? {
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      borderRadius: "0px",
                      borderColor: "rgba(168, 85, 247, 0.2)",
                      borderWidth: "1px",
                      boxShadow: "0 0 120px rgba(168, 85, 247, 0.2)",
                      scale: 1,
                      rotateX: 0,
                      rotateY: 0,
                      rotateZ: 0,
                      opacity: [1, 1, 0],
                    }
                  : {
                      top: cardRect.top,
                      left: cardRect.left,
                      width: cardRect.width,
                      height: cardRect.height,
                      borderRadius: "24px",
                      borderColor: "rgba(168, 85, 247, 0.7)",
                      borderWidth: "2px",
                      boxShadow: "0 0 45px rgba(168, 85, 247, 0.6)",
                      scale: 0.98,
                      rotateX: 2,
                      rotateY: -2,
                      rotateZ: 0.5,
                      opacity: [1, 0.9, 0],
                    }
              }
              transition={{
                duration: animatingPhase === "expanding" ? 0.72 : 0.62,
                ease: [0.16, 1, 0.3, 1], // cinematic aggressive snap easing
                times: [0, 0.75, 1],
              }}
              onAnimationComplete={() => {
                if (animatingPhase === "expanding") {
                  setAnimatingPhase(null);
                } else if (animatingPhase === "collapsing") {
                  setAnimatingPhase(null);
                  clearCardExpansion();
                }
              }}
              className="absolute bg-gradient-to-br from-[#120f32] via-[#090b1e] to-[#060814] overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Internal high-speed flare line */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 0.65,
                  ease: "easeInOut",
                }}
                className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_20px_rgba(192,132,252,1)]"
              />

              {/* Diagonal speed shard */}
              <motion.div
                initial={{ opacity: 0.8, scaleX: 0 }}
                animate={{ opacity: [0.8, 1, 0], scaleX: [0, 1.5, 2] }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-violet-600/15 via-fuchsia-600/10 to-transparent pointer-events-none"
              />

              {/* Card Header Content during flight */}
              {meta && (
                <div className="p-8 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/40 text-[11px] font-mono text-violet-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                    <span>{meta.badge || "StudyMate AI Module"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    {meta.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-violet-200/80 font-mono mt-1">
                    {meta.subtitle}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
