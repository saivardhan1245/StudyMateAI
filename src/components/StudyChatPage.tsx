import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Upload, Trash2, Sparkles, BookOpen, Layers } from "lucide-react";
import { AppPage, ChatSessionItem, DocumentItem, StudyChatMode } from "../types";

interface StudyChatPageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

const CHAT_MODES: Array<{ mode: StudyChatMode; label: string; desc: string }> = [
  { mode: "Quick", label: "Quick", desc: "Direct, concise 2-4 sentence answer" },
  { mode: "2-Mark", label: "2-Mark", desc: "Crisp university definition + key formula" },
  { mode: "5-Mark", label: "5-Mark", desc: "Structured mechanism + steps + example" },
  { mode: "10-Mark", label: "10-Mark", desc: "Comprehensive essay breakdown + derivations" },
  { mode: "Teach Me", label: "Teach Me", desc: "Step-by-step intuition, concept & self-check" },
];

export const StudyChatPage: React.FC<StudyChatPageProps> = ({ token, onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatSessionItem[]>([]);
  const [mode, setMode] = useState<StudyChatMode>("Quick");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [docRes, chatRes] = await Promise.all([
          fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/chat/history", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const docData = await docRes.json();
        const chatData = await chatRes.json();
        if (docRes.ok) {
          setDocuments(docData.documents || []);
        }
        if (chatRes.ok) {
          setChats(chatData.chats || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    setError(null);
    setAsking(true);
    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.trim(),
          mode,
          document_ids: selectedDocIds.length > 0 ? selectedDocIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to generate grounded response.");
      }
      setChats((prev) => [...prev, data.chat]);
      setQuestion("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/chat/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChats([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDocFilter = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  if (loading) {
    return <div className="text-xs text-violet-400 py-8 font-mono">Loading Study Chat workspace...</div>;
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
          Upload your lecture PDFs before starting Study Chat.
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          StudyMate AI strictly grounds every response in your uploaded course material and never fabricates answers from thin air. Upload a PDF document first to unlock Quick, 2-Mark, 5-Mark, 10-Mark, and Teach Me modes with verified page citations.
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
            <span>Upload Lecture PDF Now</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Modes (Stagger 1) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-purple-500/15"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Grounded Study Chat
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Question → Vector + BM25 Retrieval → Grounded Context to Gemma → Answer + Provenance
          </p>
        </div>

        {/* Mode Selector with Glow Pill */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 glass-panel rounded-2xl border border-purple-500/20">
          {CHAT_MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => setMode(m.mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                mode === m.mode
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-600/30 border border-violet-400/30"
                  : "text-slate-400 hover:text-white hover:bg-purple-950/30"
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* RAG Scope Filter Bar (Stagger 2) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-between gap-4 glass-panel rounded-2xl px-5 py-3.5 border border-purple-500/20"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">
            RAG Document Scope:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDocIds([])}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedDocIds.length === 0
                ? "bg-violet-600 text-white shadow-xs"
                : "glass-panel text-slate-400 hover:text-white"
            }`}
          >
            All Uploaded PDFs ({documents.length})
          </button>
          {documents.map((doc) => {
            const active = selectedDocIds.includes(doc.id);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggleDocFilter(doc.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors truncate max-w-[220px] cursor-pointer ${
                  active
                    ? "bg-violet-600 text-white shadow-xs"
                    : "glass-panel text-slate-400 hover:text-white"
                }`}
              >
                {doc.filename}
              </button>
            );
          })}
        </div>

        {chats.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </motion.div>

      {/* Chat Messages (Stagger 3) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.2, ease: "easeOut" }}
        className="space-y-6"
      >
        {chats.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-purple-500/20">
            <div className="text-base font-bold text-white font-display">
              Ask your first grounded question in <span className="text-violet-400">{mode}</span> mode
            </div>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Every response retrieves top relevant chunks from your uploaded PDFs, synthesizes an answer via Gemma, and displays exact page numbers and verbatim excerpts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {[
                "What is the Effective Access Time (EAT) formula with a TLB?",
                "Explain Belady's Anomaly and why LRU avoids it.",
                "What causes Thrashing and how does the Working Set model prevent it?",
              ].map((sampleQ) => (
                <button
                  key={sampleQ}
                  type="button"
                  onClick={() => setQuestion(sampleQ)}
                  className="px-3.5 py-2 text-xs text-slate-300 glass-panel hover:border-violet-400/50 hover:text-white rounded-xl transition-all cursor-pointer text-left"
                >
                  "{sampleQ}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4 border border-purple-500/25 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-purple-500/15">
                <div className="space-y-1">
                  <div className="text-xs text-violet-400 font-mono">
                    STUDENT QUESTION · MODE: {chat.mode.toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {chat.question}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                  {chat.model_used}
                </span>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {chat.answer}
              </div>

              {/* Verified Sources Accordion */}
              <div className="pt-4 border-t border-purple-500/15 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Verified RAG Source References ({chat.sources.length} chunks retrieved)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSourceId(expandedSourceId === chat.id ? null : chat.id)
                    }
                    className="text-xs font-mono text-violet-400 hover:text-violet-300 cursor-pointer"
                  >
                    {expandedSourceId === chat.id ? "Hide Excerpts ▲" : "Inspect Excerpts ▼"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-slate-400">
                  {chat.sources.map((src, idx) => (
                    <span key={src.chunk_id} className="text-slate-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                      [{idx + 1}] {src.filename} · Page {src.page_number} (Score: {src.score})
                    </span>
                  ))}
                </div>

                {expandedSourceId === chat.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2"
                  >
                    {chat.sources.map((src, idx) => (
                      <div
                        key={src.chunk_id}
                        className="p-3.5 bg-[#090b1c] border border-purple-500/20 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-violet-400">
                          <span>
                            Source #{idx + 1}: {src.filename} (p. {src.page_number})
                          </span>
                          <span>Relevance: {src.score}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          "{src.excerpt}"
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Input Prompt Form (Stagger 4) */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.28, ease: "easeOut" }}
        onSubmit={handleAsk}
        className="glass-panel-glow border border-purple-500/25 rounded-2xl p-4 space-y-3 shadow-xl"
      >
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300">
            ▲ {error}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Active Answer Format: <strong className="text-violet-300 font-semibold">{mode}</strong> —{" "}
            {CHAT_MODES.find((m) => m.mode === mode)?.desc}
          </span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask a question from your uploaded PDFs in ${mode} mode...`}
            disabled={asking}
            className="flex-1 px-4 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={asking || !question.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{asking ? "Retrieving & Generating..." : `Ask (${mode})`}</span>
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};
