import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Trash2, ArrowRight, X, FileText, CheckCircle2, Cpu } from "lucide-react";
import { AppPage, DocumentItem } from "../types";
import { buildRealPdfFile, SAMPLE_LECTURE_DECKS } from "../utils/pdfBuilder";

interface DocumentsPageProps {
  token: string;
  onNavigate: (page: AppPage) => void;
}

interface PipelineReport {
  validation: string;
  extraction_engine: string;
  pages_extracted: number;
  chunks_created: number;
  embedding_dimension: number;
  vector_store: string;
  sample_chunk: {
    page_number: number;
    preview: string;
  };
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ token, onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [courseTag, setCourseTag] = useState("CS 301 Operating Systems");
  const [error, setError] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<{ doc: DocumentItem; report: PipelineReport } | null>(null);
  const [inspectDoc, setInspectDoc] = useState<DocumentItem | null>(null);
  const [inspectChunks, setInspectChunks] = useState<Array<{ chunk_id: string; page_number: number; chunk_index: number; text: string }>>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleUploadFile = async (file: File, customCourseTag?: string) => {
    setError(null);
    setUploading(true);
    setLastReport(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_tag", (customCourseTag || courseTag).trim());

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Upload and vector indexing failed.");
      }
      setLastReport({ doc: data.document, report: data.pipeline_report });
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "PDF upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleUploadSampleDeck = async (deckId: string) => {
    const deck = SAMPLE_LECTURE_DECKS.find((d) => d.id === deckId);
    if (!deck) return;
    setCourseTag(deck.courseTag);
    const pdfFile = buildRealPdfFile(deck.filename, deck.pages);
    await handleUploadFile(pdfFile, deck.courseTag);
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (inspectDoc?.id === docId) {
          setInspectDoc(null);
          setInspectChunks([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInspectChunks = async (doc: DocumentItem) => {
    setInspectDoc(doc);
    setLoadingChunks(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/chunks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setInspectChunks(data.chunks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChunks(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-500/15">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Lecture Documents & RAG Vector Store
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            PDF Upload → Header Validation → Page Extraction → Semantic Overlapping Chunks → Vector Index
          </p>
        </div>

        {documents.length > 0 && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onNavigate("chat")}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Ask Questions on Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form Box */}
        <div className="lg:col-span-7 glass-panel-glow border border-purple-500/25 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-display">
              Upload Your Lecture PDF
            </h2>
            <p className="text-xs text-slate-400">
              Select any course `.pdf` file. Text is extracted page-by-page and indexed under your account with verifiable page citations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Course / Subject Label
              </label>
              <input
                type="text"
                value={courseTag}
                onChange={(e) => setCourseTag(e.target.value)}
                placeholder="e.g., CS 301 Operating Systems"
                className="w-full px-3.5 py-2.5 text-sm bg-[#090b1c] border border-purple-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload-input"
              />
              <label
                htmlFor="pdf-upload-input"
                className={`w-full py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-600/30 border border-violet-400/30 flex items-center justify-center gap-2 cursor-pointer ${
                  uploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? "Extracting & Indexing PDF..." : "Choose PDF File (.pdf)"}</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300 font-medium font-mono">
              ▲ Ingestion Error: {error}
            </div>
          )}

          {lastReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">
                  ● RAG Ingestion Complete: {lastReport.doc.filename}
                </span>
                <span className="text-emerald-300">
                  {lastReport.report.pages_extracted} Pages · {lastReport.report.chunks_created} Chunks
                </span>
              </div>
              <div className="text-slate-400">
                Vector Store: {lastReport.report.vector_store} ({lastReport.report.embedding_dimension}-dim)
              </div>
              <div className="bg-[#090b1c] p-3 rounded-xl border border-purple-500/20 text-slate-300">
                <span className="text-violet-400 block mb-0.5">
                  Sample Chunk Excerpt (p. {lastReport.report.sample_chunk.page_number}):
                </span>
                "{lastReport.report.sample_chunk.preview}"
              </div>
            </motion.div>
          )}
        </div>

        {/* Real Binary Sample PDF Generator */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-4 border border-purple-500/20">
          <div className="space-y-1">
            <div className="text-xs font-mono text-violet-400 font-semibold tracking-wider">BROWSER BINARY GENERATOR</div>
            <h2 className="text-base font-bold text-white font-display">
              Don't have a lecture PDF on hand?
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate and index real, multi-page binary `.pdf` lecture notes in one click. Tested with genuine PDF 1.4 syntax and verified page provenance.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {SAMPLE_LECTURE_DECKS.map((deck) => (
              <div
                key={deck.id}
                className="p-3.5 bg-[#090b1c] border border-purple-500/20 rounded-2xl flex items-center justify-between gap-3 hover:border-violet-400/40 transition-all"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {deck.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {deck.pages.length} Pages · Real PDF 1.4 Stream
                  </div>
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => handleUploadSampleDeck(deck.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-violet-300 bg-purple-950/60 hover:bg-violet-900/80 border border-violet-500/30 rounded-xl whitespace-nowrap transition-colors cursor-pointer"
                >
                  {uploading ? "Indexing..." : "Build & Upload"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-purple-500/25">
        <div className="px-6 py-4 border-b border-purple-500/15 flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-display">
            Your Indexed Lecture Documents ({documents.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            User Workspace Isolation
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-violet-400 font-mono">Loading your indexed documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="text-sm font-semibold text-white">
              No PDFs uploaded in your account yet
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upload a `.pdf` file above or click "Build & Upload" on one of the sample decks to test the grounded Gemma RAG engine.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-500/15 text-[11px] font-mono text-slate-400 bg-purple-950/20">
                  <th className="py-3 px-6">Document Filename</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4 text-right">Pages</th>
                  <th className="py-3 px-4 text-right">RAG Chunks</th>
                  <th className="py-3 px-4 text-right">Words</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-xs">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-purple-950/20 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-400" />
                      <span>{doc.filename}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {doc.course_tag}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-300">
                      {doc.page_count}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-300">
                      {doc.chunk_count}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-300">
                      {doc.word_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleInspectChunks(doc)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white glass-panel rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect Chunks
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Delete document and chunks"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Chunks Drawer */}
      {inspectDoc && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4 border border-purple-500/25 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Extracted RAG Chunks: {inspectDoc.filename}
              </h3>
              <p className="text-xs text-violet-400 font-mono">
                {inspectChunks.length} chunks indexed in dense vector store
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInspectDoc(null)}
              className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {loadingChunks ? (
            <div className="text-xs text-violet-400 py-4 font-mono">Loading vector chunks...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {inspectChunks.map((c) => (
                <div key={c.chunk_id} className="p-3.5 bg-[#090b1c] border border-purple-500/20 rounded-2xl space-y-1 text-xs">
                  <div className="text-[11px] font-mono text-violet-400 flex items-center justify-between">
                    <span>Page {c.page_number}</span>
                    <span>Chunk #{c.chunk_index + 1}</span>
                  </div>
                  <p className="text-slate-300 font-mono leading-relaxed line-clamp-3">
                    "{c.text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
