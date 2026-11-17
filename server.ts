import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface DocumentPagePayload {
  pageNumber: number;
  text: string;
}

interface DocumentPayload {
  id: string;
  title: string;
  subject: string;
  pages: DocumentPagePayload[];
}

interface RetrievedChunk {
  docId: string;
  docTitle: string;
  subject: string;
  pageNumber: number;
  text: string;
  score: number;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
  "and", "or", "but", "not", "this", "that", "these", "those", "it",
  "its", "what", "which", "who", "whom", "how", "why", "when", "where",
  "can", "could", "should", "would", "do", "does", "did", "explain",
  "give", "me", "example", "summarize", "summary", "important", "points",
  "simple", "words", "about", "topic", "chapter", "please", "tell",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function retrieveRelevantPassages(
  query: string,
  documents: DocumentPayload[],
  topK = 6
): RetrievedChunk[] {
  const queryLower = query.toLowerCase();
  const queryTokens = tokenize(query);
  const chunks: RetrievedChunk[] = [];

  for (const doc of documents) {
    for (const page of doc.pages) {
      const textLower = page.text.toLowerCase();
      const titleLower = `${doc.title} ${doc.subject}`.toLowerCase();
      let score = 0;

      if (queryTokens.length === 0) {
        // Broad queries like "Summarize this chapter" or "Explain this topic"
        score = page.text.trim().length > 40 ? 1 : 0;
      } else {
        for (const token of queryTokens) {
          const matches = textLower.split(token).length - 1;
          if (matches > 0) {
            score += Math.min(matches, 5) * 2;
          }
          if (titleLower.includes(token)) {
            score += 3;
          }
        }
        if (queryLower.length > 5 && textLower.includes(queryLower)) {
          score += 8;
        }
      }

      if (score > 0 && page.text.trim().length > 0) {
        chunks.push({
          docId: doc.id,
          docTitle: doc.title,
          subject: doc.subject,
          pageNumber: page.pageNumber,
          text: page.text.slice(0, 2200),
          score,
        });
      }
    }
  }

  chunks.sort((a, b) => b.score - a.score);
  return chunks.slice(0, topK);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  app.get("/api/health", (_req, res) => {
    const aiConfigured = Boolean(getAiClient());
    res.json({
      ok: true,
      aiConfigured,
      mode: aiConfigured ? "gemini-grounded" : "offline-demo",
    });
  });

  app.post("/api/ask", async (req, res) => {
    try {
      const { question, documents, subjectFilter } = req.body as {
        question?: string;
        documents?: DocumentPayload[];
        subjectFilter?: string;
      };

      if (!question || typeof question !== "string" || !question.trim()) {
        res.status(400).json({ error: "Question is required." });
        return;
      }

      const docs = Array.isArray(documents) ? documents : [];
      const filteredDocs =
        subjectFilter && subjectFilter !== "all"
          ? docs.filter((d) => d.subject === subjectFilter)
          : docs;

      if (filteredDocs.length === 0) {
        res.json({
          insufficientEvidence: true,
          answer:
            "Insufficient evidence in your material. Please upload relevant notes or choose another question.",
          keyPoints: [],
          simpleExplanation:
            "No course documents match the current selection. Upload a PDF or lecture note in My Library to ask syllabus-grounded questions.",
          citations: [],
          groundedMode: "live-ai",
        });
        return;
      }

      const retrieved = retrieveRelevantPassages(question, filteredDocs, 6);

      // If no relevant chunks at all when user asked a specific question
      const queryTokens = tokenize(question);
      if (retrieved.length === 0 || (queryTokens.length >= 2 && retrieved[0].score < 2)) {
        res.json({
          insufficientEvidence: true,
          answer:
            "Insufficient evidence in your material. Please upload relevant notes or choose another question.",
          keyPoints: [],
          simpleExplanation:
            "Your uploaded course notes do not contain clear coverage for this question. Try selecting a different subject or uploading the relevant lecture PDF.",
          citations: [],
          groundedMode: "live-ai",
        });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server.",
          code: "AI_NOT_CONFIGURED",
        });
        return;
      }

      const contextBlocks = retrieved
        .map(
          (c, idx) =>
            `[SOURCE ${idx + 1}] docId="${c.docId}" | title="${c.docTitle}" | subject="${c.subject}" | page=${c.pageNumber}\n${c.text}`
        )
        .join("\n\n---\n\n");

      const systemInstruction = `You are AI Study Buddy, a strict syllabus-grounded academic tutor for undergraduate CS and AIML students.
RULES:
1. Answer ONLY using the provided [SOURCE] excerpts from the student's uploaded course materials.
2. NEVER use outside knowledge, invent facts, or fabricate page numbers or document titles.
3. If the provided [SOURCE] excerpts do not contain enough evidence to reliably answer the student's question, set insufficientEvidence to true, set answer to "Insufficient evidence in your material. Please upload relevant notes or choose another question.", leave keyPoints empty, and leave citations empty.
4. When evidence IS sufficient, set insufficientEvidence to false, and provide:
   - answer: A clear, well-structured technical answer grounded strictly in the sources.
   - keyPoints: 3 to 5 concise takeaway bullets directly supported by the sources.
   - simpleExplanation: An intuitive, beginner-friendly explanation or analogy based on the source concepts.
   - citations: 1 to 3 exact citations using ONLY the docId, docTitle, and pageNumber values present in the [SOURCE] headers, along with a short verbatim or near-verbatim excerpt from that page.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `STUDENT QUESTION:\n${question}\n\nCOURSE MATERIAL EXCERPTS:\n${contextBlocks}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insufficientEvidence: { type: Type.BOOLEAN },
              answer: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              simpleExplanation: { type: Type.STRING },
              citations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    docId: { type: Type.STRING },
                    docTitle: { type: Type.STRING },
                    pageNumber: { type: Type.INTEGER },
                    excerpt: { type: Type.STRING },
                  },
                  required: ["docId", "docTitle", "pageNumber", "excerpt"],
                },
              },
            },
            required: [
              "insufficientEvidence",
              "answer",
              "keyPoints",
              "simpleExplanation",
              "citations",
            ],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText) as {
        insufficientEvidence: boolean;
        answer: string;
        keyPoints: string[];
        simpleExplanation: string;
        citations: Array<{
          docId: string;
          docTitle: string;
          pageNumber: number;
          excerpt: string;
        }>;
      };

      // Strictly verify every returned citation against retrieved source pages (never allow fabricated pages)
      const validCitations = (parsed.citations || []).filter((cit) =>
        retrieved.some(
          (r) => r.docId === cit.docId && r.pageNumber === cit.pageNumber
        )
      );

      if (parsed.insufficientEvidence) {
        res.json({
          insufficientEvidence: true,
          answer:
            "Insufficient evidence in your material. Please upload relevant notes or choose another question.",
          keyPoints: [],
          simpleExplanation: parsed.simpleExplanation || "",
          citations: [],
          groundedMode: "live-ai",
        });
        return;
      }

      res.json({
        insufficientEvidence: false,
        answer: parsed.answer,
        keyPoints: parsed.keyPoints || [],
        simpleExplanation: parsed.simpleExplanation || "",
        citations:
          validCitations.length > 0
            ? validCitations
            : [
                {
                  docId: retrieved[0].docId,
                  docTitle: retrieved[0].docTitle,
                  pageNumber: retrieved[0].pageNumber,
                  excerpt: retrieved[0].text.slice(0, 200) + "...",
                },
              ],
        groundedMode: "live-ai",
      });
    } catch (err) {
      console.error("Error in /api/ask:", err);
      res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate syllabus-grounded answer.",
      });
    }
  });

  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const { subject, topic, numQuestions = 5, documents } = req.body as {
        subject?: string;
        topic?: string;
        numQuestions?: number;
        documents?: DocumentPayload[];
      };

      const docs = Array.isArray(documents) ? documents : [];
      const subjectDocs =
        subject && subject !== "all"
          ? docs.filter((d) => d.subject === subject)
          : docs;

      const retrieved = retrieveRelevantPassages(
        `${subject || ""} ${topic || ""}`,
        subjectDocs.length > 0 ? subjectDocs : docs,
        8
      );

      if (retrieved.length === 0) {
        res.status(400).json({
          error:
            "No course material found for this topic. Upload relevant notes in My Library first.",
        });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server.",
          code: "AI_NOT_CONFIGURED",
        });
        return;
      }

      const count = Math.max(1, Math.min(10, Number(numQuestions) || 5));
      const contextBlocks = retrieved
        .map(
          (c, idx) =>
            `[SOURCE ${idx + 1}] docId="${c.docId}" | title="${c.docTitle}" | subject="${c.subject}" | page=${c.pageNumber}\n${c.text}`
        )
        .join("\n\n---\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Generate exactly ${count} multiple-choice questions for an undergraduate CS/AIML student.
Target Subject: ${subject || "Course Material"}
Target Syllabus Topic: ${topic || "General Review"}

Use ONLY these source passages:\n${contextBlocks}`,
        config: {
          systemInstruction: `You are an academic assessment generator. Create ${count} rigorous undergraduate CS/AIML MCQ questions grounded strictly in the provided [SOURCE] passages.
Each question must have:
- topic: "${topic || "Core Concepts"}"
- question: Clear conceptual or analytical question
- options: Exactly 4 distinct plausible options
- correctIndex: Integer 0..3 indicating the correct option
- explanation: Short explanation citing why the answer is correct
- sourceDocId: Exact docId from [SOURCE]
- sourceDocTitle: Exact title from [SOURCE]
- sourcePage: Exact integer page from [SOURCE]
- sourcePassage: Verbatim 1-2 sentence passage from that source page supporting the answer`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    sourceDocId: { type: Type.STRING },
                    sourceDocTitle: { type: Type.STRING },
                    sourcePage: { type: Type.INTEGER },
                    sourcePassage: { type: Type.STRING },
                  },
                  required: [
                    "topic",
                    "question",
                    "options",
                    "correctIndex",
                    "explanation",
                    "sourceDocId",
                    "sourceDocTitle",
                    "sourcePage",
                    "sourcePassage",
                  ],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      const rawText = (response.text ?? '{"questions":[]}').trim();
      const parsed = JSON.parse(rawText) as {
        questions: Array<{
          topic: string;
          question: string;
          options: string[];
          correctIndex: number;
          explanation: string;
          sourceDocId: string;
          sourceDocTitle: string;
          sourcePage: number;
          sourcePassage: string;
        }>;
      };

      const sanitized = (parsed.questions || []).slice(0, count).map((q, i) => {
        const matchedSource =
          retrieved.find(
            (r) => r.docId === q.sourceDocId && r.pageNumber === q.sourcePage
          ) || retrieved[i % retrieved.length];

        return {
          id: `quiz-q-${Date.now()}-${i}`,
          subject: subject || matchedSource.subject,
          topic: q.topic || topic || "General",
          question: q.question,
          options: (q.options || []).slice(0, 4),
          correctIndex: Math.max(0, Math.min(3, Number(q.correctIndex) || 0)),
          explanation: q.explanation,
          sourceDocId: matchedSource.docId,
          sourceDocTitle: matchedSource.docTitle,
          sourcePage: matchedSource.pageNumber,
          sourcePassage: q.sourcePassage || matchedSource.text.slice(0, 220),
        };
      });

      res.json({
        questions: sanitized,
        groundedMode: "live-ai",
      });
    } catch (err) {
      console.error("Error in /api/quiz/generate:", err);
      res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate syllabus-grounded quiz.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Study Buddy server running at http://localhost:${PORT}`);
  });
}

startServer();
