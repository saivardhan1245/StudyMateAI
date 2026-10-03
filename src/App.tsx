import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GraduationCap,
  CheckCircle,
  BarChart2,
  Calendar,
  Zap,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { AppPage, User } from "./types";
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { DocumentsPage } from "./components/DocumentsPage";
import { StudyChatPage } from "./components/StudyChatPage";
import { TeachMePage } from "./components/TeachMePage";
import { QuizPage } from "./components/QuizPage";
import { ProgressPage } from "./components/ProgressPage";
import { StudyPlanPage } from "./components/StudyPlanPage";
import { LastMinuteRescuePage } from "./components/LastMinuteRescuePage";
import { GeometricWipe } from "./components/GeometricWipe";
import {
  CardExpansionProvider,
  useCardExpansion,
} from "./context/CardExpansionContext";
import { CardExpansionOverlay } from "./components/CardExpansionOverlay";

const NAV_ITEMS: Array<{
  id: AppPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "documents", label: "Documents (RAG)", icon: FileText },
  { id: "chat", label: "Study Chat", icon: MessageSquare },
  { id: "teach", label: "Teach Me", icon: GraduationCap },
  { id: "quiz", label: "Quiz", icon: CheckCircle },
  { id: "progress", label: "Progress", icon: BarChart2 },
  { id: "plan", label: "Study Plan", icon: Calendar },
  { id: "rescue", label: "Last-Minute Rescue", icon: Zap },
];

const PAGE_ORDER: AppPage[] = [
  "dashboard",
  "documents",
  "chat",
  "teach",
  "quiz",
  "progress",
  "plan",
  "rescue",
];

// Physical 3D directional flick variants
const flickVariants = {
  enter: (dir: number) => ({
    x: dir === 0 ? 0 : dir > 0 ? 140 : -140,
    y: dir === 0 ? 80 : 0,
    rotateY: dir === 0 ? 0 : dir > 0 ? 10 : -10,
    rotateX: dir === 0 ? 8 : 0,
    scale: 0.88,
    opacity: 0,
    filter: "blur(6px)",
  }),
  center: {
    x: 0,
    y: 0,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.58,
      ease: [0.16, 1, 0.3, 1] as const, // fast initial movement, controlled deceleration, clean settle
    },
  },
  exit: (dir: number) => ({
    x: dir === 0 ? 0 : dir > 0 ? -150 : 150,
    y: dir === 0 ? -70 : 0,
    rotateY: dir === 0 ? 0 : dir > 0 ? -12 : 12,
    rotateX: dir === 0 ? -8 : 0,
    scale: 0.86,
    opacity: 0,
    filter: "blur(8px)",
    transition: {
      duration: 0.5,
      ease: [0.2, 0.9, 0.1, 1] as const,
    },
  }),
};

function AppInner() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("studymate_jwt")
  );
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeDirection, setWipeDirection] = useState<"left" | "right" | "up" | "down">("right");
  const [flickDir, setFlickDir] = useState<number>(1);
  const [isExpandedFromLanding, setIsExpandedFromLanding] = useState(false);

  const { phase, sourceContext } = useCardExpansion();

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("studymate_jwt");
      if (!savedToken) {
        setCheckingAuth(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!res.ok) {
          throw new Error("Session expired");
        }
        const data = await res.json();
        setToken(savedToken);
        setUser(data.user);
      } catch {
        localStorage.removeItem("studymate_jwt");
        setToken(null);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifySession();
  }, []);

  // When card collapse completes, if we expanded from landing, return cleanly to landing
  useEffect(() => {
    if (phase === "idle" && isExpandedFromLanding) {
      setIsExpandedFromLanding(false);
      setCurrentPage("dashboard");
    }
  }, [phase, isExpandedFromLanding]);

  const handleNavigate = (page: AppPage) => {
    if (page === currentPage) return;
    const prevIdx = PAGE_ORDER.indexOf(currentPage);
    const nextIdx = PAGE_ORDER.indexOf(page);
    let dir: "left" | "right" | "up" | "down" = "right";
    let numeric = 1;

    if (page === "rescue" || currentPage === "rescue") {
      dir = "up";
      numeric = 0;
    } else if (nextIdx > prevIdx) {
      dir = "right";
      numeric = 1;
    } else {
      dir = "left";
      numeric = -1;
    }

    setWipeDirection(dir);
    setFlickDir(numeric);
    setIsWiping(true);
    setCurrentPage(page);
    setTimeout(() => setIsWiping(false), 620);
  };

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem("studymate_jwt", newToken);
    setToken(newToken);
    setUser(newUser);
    setIsExpandedFromLanding(false);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("studymate_jwt");
    setToken(null);
    setUser(null);
    setIsExpandedFromLanding(false);
  };

  // Card Expansion handler from Landing Page:
  // Immediately opens the real feature workspace, bootstrapping an instant guest session if unauthenticated
  const handleExploreFeature = async (feature: AppPage) => {
    setIsExpandedFromLanding(true);
    setCurrentPage(feature);

    if (!token || !user) {
      try {
        const guestEmail = `student_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@university.edu`;
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Student Explorer",
            email: guestEmail,
            password: "password123",
            institution: "University Workspace",
            major: "General Sciences",
          }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("studymate_jwt", data.token);
          setToken(data.token);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auto guest session initialization:", err);
      }
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060814] text-xs text-violet-400 font-mono">
        Verifying StudyMate AI JWT session...
      </div>
    );
  }

  // If user is not logged in AND not currently exploring an expanded feature card from Landing:
  const showLanding = (!token || !user) && !isExpandedFromLanding;

  if (showLanding) {
    return (
      <>
        <CardExpansionOverlay />
        <LandingPage
          onAuthSuccess={handleAuthSuccess}
          onExploreFeature={handleExploreFeature}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#060814] text-slate-100 relative selection:bg-purple-500 selection:text-white">
      <GeometricWipe isTransitioning={isWiping} direction={wipeDirection} />
      <CardExpansionOverlay />

      {/* Ambient atmospheric glow in workspace */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#090b1c]/80 backdrop-blur-md border-r border-purple-500/15 flex flex-col justify-between shrink-0 hidden md:flex z-20">
        <div className="p-6 space-y-6">
          <div className="pb-4 border-b border-purple-500/15">
            <button
              type="button"
              onClick={() => handleNavigate("dashboard")}
              className="text-xl font-bold tracking-tight text-white font-display cursor-pointer hover:text-violet-300 transition-colors flex items-center gap-2.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] inline-block"></span>
              StudyMate AI
            </button>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                    active
                      ? "text-white bg-violet-600/25 border border-violet-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-purple-950/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-violet-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(168,85,247,1)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-purple-500/15 space-y-3">
          {user && (
            <div className="px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
              <div className="font-semibold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-300 rounded-lg hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060814] relative z-10">
        <header className="flex items-center justify-between px-6 lg:px-8 py-4 bg-[#090b1c]/70 backdrop-blur-md border-b border-purple-500/15 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {isExpandedFromLanding && (
              <button
                type="button"
                onClick={() => {
                  setIsExpandedFromLanding(false);
                  setCurrentPage("dashboard");
                }}
                className="px-2.5 py-1 rounded-lg bg-violet-950/60 border border-violet-500/30 text-xs text-violet-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all hover:bg-violet-900/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            )}
            <div className="text-sm font-medium text-slate-400">
              Workspace /{" "}
              <span className="text-white font-semibold">
                {NAV_ITEMS.find((n) => n.id === currentPage)?.label}
              </span>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  currentPage === item.id ? "bg-violet-600 text-white" : "text-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavigate("documents")}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-97 rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-md shadow-violet-600/30 border border-violet-400/30"
            >
              + Upload PDF
            </button>
          </div>
        </header>

        {/* 3D Directional Flick Perspective Stage */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-8 py-8 overflow-hidden perspective-1200 preserve-3d">
          <AnimatePresence mode="wait" custom={flickDir}>
            <motion.div
              key={currentPage}
              custom={flickDir}
              variants={flickVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="preserve-3d"
            >
              {currentPage === "dashboard" && user && (
                <DashboardPage
                  token={token || ""}
                  user={user}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === "documents" && (
                <DocumentsPage token={token || ""} onNavigate={handleNavigate} />
              )}
              {currentPage === "chat" && (
                <StudyChatPage token={token || ""} onNavigate={handleNavigate} />
              )}
              {currentPage === "teach" && (
                <TeachMePage token={token || ""} onNavigate={handleNavigate} />
              )}
              {currentPage === "quiz" && (
                <QuizPage token={token || ""} onNavigate={handleNavigate} />
              )}
              {currentPage === "progress" && (
                <ProgressPage token={token || ""} onNavigate={handleNavigate} />
              )}
              {currentPage === "plan" && (
                <StudyPlanPage token={token || ""} onNavigate={handleNavigate} />
              )}
              {currentPage === "rescue" && (
                <LastMinuteRescuePage token={token || ""} onNavigate={handleNavigate} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <CardExpansionProvider>
      <AppInner />
    </CardExpansionProvider>
  );
}

export default App;
