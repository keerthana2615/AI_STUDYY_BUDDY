import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { DocumentPage } from "../types/study";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedDocumentData {
  pageCount: number;
  pages: DocumentPage[];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function extractDocumentPages(
  file: File
): Promise<ExtractedDocumentData> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".pdf") || file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pages: DocumentPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean);
      const joined = strings.join(" ").replace(/\s+/g, " ").trim();
      pages.push({
        pageNumber: i,
        text:
          joined ||
          `[Page ${i} contains visual/scanned content with no selectable text layer.]`,
      });
    }

    return {
      pageCount: pdf.numPages,
      pages,
    };
  }

  // Fallback for .txt / .md course notes
  const text = await file.text();
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const chunkSize = 1800;
  const pages: DocumentPage[] = [];

  if (!normalized) {
    pages.push({ pageNumber: 1, text: "Empty document uploaded." });
  } else {
    for (let i = 0; i < normalized.length; i += chunkSize) {
      pages.push({
        pageNumber: pages.length + 1,
        text: normalized.slice(i, i + chunkSize),
      });
    }
  }

  return {
    pageCount: pages.length,
    pages,
  };
}
