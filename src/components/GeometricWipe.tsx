import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface GeometricWipeProps {
  isTransitioning: boolean;
  direction?: "left" | "right" | "up" | "down";
}

export const GeometricWipe: React.FC<GeometricWipeProps> = ({
  isTransitioning,
  direction = "right",
}) => {
  const getPanelMotion = () => {
    switch (direction) {
      case "left":
        return {
          initial: { x: "100%", skewX: "12deg" },
          animate: { x: ["100%", "0%", "-100%"] },
        };
      case "up":
        return {
          initial: { y: "100%", skewY: "-6deg" },
          animate: { y: ["100%", "0%", "-100%"] },
        };
      case "down":
        return {
          initial: { y: "-100%", skewY: "6deg" },
          animate: { y: ["-100%", "0%", "100%"] },
        };
      case "right":
      default:
        return {
          initial: { x: "-100%", skewX: "-12deg" },
          animate: { x: ["-100%", "0%", "100%"] },
        };
    }
  };

  const panelMotion = getPanelMotion();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Layer 1: Heavy Deep Obsidian Takeover Panel */}
          <motion.div
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.62,
              ease: [0.16, 1, 0.3, 1], // cinematic aggressive snap
              times: [0, 0.48, 1],
            }}
            className="absolute inset-0 bg-gradient-to-r from-[#060814] via-[#0f112e] to-[#060814] border-x-2 border-violet-500/40 shadow-[0_0_100px_rgba(147,51,234,0.4)]"
          />

          {/* Layer 2: Electric Violet Trailing Shard */}
          <motion.div
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            transition={{
              duration: 0.58,
              delay: 0.04,
              ease: [0.2, 0.9, 0.1, 1],
              times: [0, 0.5, 1],
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-600/25 to-transparent pointer-events-none"
          />

          {/* Layer 3: Razor Leading Edge Laser Beam */}
          <motion.div
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            transition={{
              duration: 0.62,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.48, 1],
            }}
            className={`absolute ${
              direction === "up" || direction === "down"
                ? "inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_20px_rgba(192,132,252,1)]"
                : "inset-y-0 w-[3px] bg-gradient-to-b from-transparent via-violet-300 to-transparent shadow-[0_0_20px_rgba(192,132,252,1)]"
            }`}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
