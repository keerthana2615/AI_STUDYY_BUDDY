import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { useStudy } from "../context/StudyContext";

export function CitationPreviewModal() {
  const { citationPreview, closeCitationPreview, documents } = useStudy();
  const doc = documents.find((d) => d.id === citationPreview?.docId);
  const [pageNum, setPageNum] = useState<number>(
    citationPreview?.pageNumber ?? 1
  );

  useEffect(() => {
    if (citationPreview) {
      setPageNum(citationPreview.pageNumber);
    }
  }, [citationPreview]);

  if (!citationPreview || !doc) return null;

  const activePage =
    doc.pages.find((p) => p.pageNumber === pageNum) || doc.pages[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-modal-title"
      onClick={closeCitationPreview}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 bg-[#F8FAFC]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{doc.subject}</span>
              <span aria-hidden="true">·</span>
              <span>
                {doc.origin === "sample" ? "Sample Course Pack" : "Your Upload"}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Page {activePage?.pageNumber ?? pageNum} of {doc.pageCount}
              </span>
            </div>
            <h3
              id="citation-modal-title"
              className="mt-1 flex items-center gap-2 text-base font-semibold text-[#172554] truncate"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#2563EB]" />
              <span className="truncate">{doc.title}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={closeCitationPreview}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB]"
            aria-label="Close document preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {citationPreview.highlightExcerpt &&
            pageNum === citationPreview.pageNumber && (
              <div className="rounded-lg border border-[#DBEAFE] bg-[#DBEAFE]/35 px-4 py-3">
                <p className="text-xs font-medium text-[#172554] mb-1">
                  Cited Source Passage (Page {citationPreview.pageNumber})
                </p>
                <p className="text-sm leading-relaxed text-[#0F172A]">
                  “{citationPreview.highlightExcerpt}”
                </p>
              </div>
            )}

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-mono tabular-nums text-slate-400 mb-3">
              Document Text — Page {activePage?.pageNumber ?? pageNum}
            </p>
            <p className="text-[15px] leading-7 text-slate-800 whitespace-pre-wrap">
              {activePage?.text || "No extractable text on this page."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-[#F8FAFC]">
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            File: {doc.fileName}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageNum <= 1}
              onClick={() => setPageNum((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev Page
            </button>
            <button
              type="button"
              disabled={pageNum >= doc.pageCount}
              onClick={() => setPageNum((p) => Math.min(doc.pageCount, p + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 transition-colors"
            >
              Next Page
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
