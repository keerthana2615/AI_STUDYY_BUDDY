import { useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  FolderOpen,
  ListPlus,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";

export function LibraryPage() {
  const {
    documents,
    topics,
    subjects,
    includeSampleData,
    setIncludeSampleData,
    uploadDocument,
    deleteDocument,
    addTopic,
    addBulkTopics,
    deleteTopic,
    openCitationPreview,
  } = useStudy();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0] || "CS301 · Machine Learning"
  );
  const [customSubject, setCustomSubject] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Syllabus topic inputs
  const [topicName, setTopicName] = useState("");
  const [topicUnit, setTopicUnit] = useState("Unit 1");
  const [topicWeight, setTopicWeight] = useState("0.85");
  const [topicSubject, setTopicSubject] = useState(
    subjects[0] || "CS301 · Machine Learning"
  );
  const [bulkTopicsText, setBulkTopicsText] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  const effectiveUploadSubject =
    selectedSubject === "__custom__"
      ? customSubject.trim() || "General Course Notes"
      : selectedSubject;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    for (const file of Array.from(fileList)) {
      const lower = file.name.toLowerCase();
      if (
        !lower.endsWith(".pdf") &&
        !lower.endsWith(".txt") &&
        !lower.endsWith(".md")
      ) {
        setUploadError(
          `Unsupported file "${file.name}". Please upload PDF, TXT, or Markdown lecture notes.`
        );
        continue;
      }
      try {
        setUploadingName(file.name);
        await uploadDocument(file, effectiveUploadSubject);
      } catch (err) {
        setUploadError(
          err instanceof Error
            ? `Could not process ${file.name}: ${err.message}`
            : `Failed to process ${file.name}.`
        );
      } finally {
        setUploadingName(null);
      }
    }
  };

  const filteredDocuments =
    filterSubject === "all"
      ? documents
      : documents.filter((d) => d.subject === filterSubject);

  const filteredTopics =
    filterSubject === "all"
      ? topics
      : topics.filter((t) => t.subject === filterSubject);

  const handleAddSingleTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    addTopic(topicName, topicSubject, topicUnit, Number(topicWeight) || 0.8);
    setTopicName("");
  };

  const handleAddBulkTopics = (e: React.FormEvent) => {
    e.preventDefault();
    const count = addBulkTopics(bulkTopicsText, topicSubject);
    if (count > 0) {
      setBulkTopicsText("");
      setBulkFeedback(`Added ${count} syllabus topic${count === 1 ? "" : "s"} to ${topicSubject}.`);
      setTimeout(() => setBulkFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554]">
            My Library
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload your lecture notes, textbooks, and syllabus topics to ground
            AI answers and quizzes.
          </p>
        </div>

        <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeSampleData}
            onChange={(e) => setIncludeSampleData(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          Include Sample CS/AIML Course Pack
        </label>
      </div>

      {/* Upload PDF Dropzone + Subject Selector */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#172554]">
              Upload Course Materials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pages and text are extracted locally in your browser for exact
              page-number citations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label
              htmlFor="upload-subject-select"
              className="text-xs font-medium text-slate-600"
            >
              Assign to Subject:
            </label>
            <select
              id="upload-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
              <option value="__custom__">+ New Subject</option>
            </select>

            {selectedSubject === "__custom__" && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g., CS401 · NLP"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
            )}
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-[#2563EB] bg-[#DBEAFE]/40"
              : "border-slate-300 bg-[#F8FAFC] hover:border-[#2563EB]/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#172554]">
            {uploadingName
              ? `Extracting pages from ${uploadingName}...`
              : "Drag and drop your PDF lecture notes here"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supports multi-page PDF, TXT, and Markdown files
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={Boolean(uploadingName)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            Upload PDF / Notes
          </button>
        </div>

        {uploadError && (
          <p className="text-xs font-medium text-red-600">{uploadError}</p>
        )}
      </section>

      {/* Subject Filter & Uploaded Documents Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-[#172554]">
            Course Documents ({filteredDocuments.length})
          </h2>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-200/70">
            <button
              type="button"
              onClick={() => setFilterSubject("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                filterSubject === "all"
                  ? "bg-white text-[#172554] shadow-sm"
                  : "text-slate-600 hover:text-[#172554]"
              }`}
            >
              All Subjects
            </button>
            {subjects.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setFilterSubject(subj)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filterSubject === subj
                    ? "bg-white text-[#172554] shadow-sm"
                    : "text-slate-600 hover:text-[#172554]"
                }`}
              >
                {subj.split("·")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-[#172554]">
              No documents uploaded yet
            </h3>
            <p className="mt-1.5 max-w-md mx-auto text-sm text-slate-500">
              Upload a course PDF above or re-enable the Sample CS/AIML Course
              Pack to start asking grounded questions and generating quizzes.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Your First PDF
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <article
                key={doc.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-[#2563EB]/40 transition-colors"
              >
                <div>
                  <p className="text-xs text-slate-500 truncate">
                    {doc.subject} ·{" "}
                    {doc.origin === "sample" ? "Sample Course Pack" : "Your Upload"}
                  </p>
                  <h3 className="mt-1.5 flex items-start gap-2 font-display text-base font-semibold text-[#172554]">
                    <FileText className="h-4 w-4 text-[#2563EB] shrink-0 mt-1" />
                    <span className="line-clamp-2">{doc.title}</span>
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono tabular-nums">
                    <span>{doc.uploadDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.pageCount} pages</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.fileSizeLabel}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {doc.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        openCitationPreview({ docId: doc.id, pageNumber: 1 })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#172554] hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#2563EB]" />
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDocument(doc.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap"
                      aria-label={`Delete ${doc.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Syllabus Topic List Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#172554]">
            Syllabus Topic List
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track exam weights and mastery per syllabus unit, or paste a comma/line
            separated list of topics from your university syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Topic Forms */}
          <div className="lg:col-span-5 space-y-5">
            <form
              onSubmit={handleAddSingleTopic}
              className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-3"
            >
              <p className="text-xs font-semibold text-[#172554]">
                Add Individual Topic
              </p>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Topic name (e.g., Support Vector Machines)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={topicSubject}
                  onChange={(e) => setTopicSubject(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-[#2563EB] focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={topicUnit}
                  onChange={(e) => setTopicUnit(e.target.value)}
                  placeholder="Unit (e.g., Unit 3)"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-slate-600 flex items-center gap-2">
                  Exam Weight:
                  <select
                    value={topicWeight}
                    onChange={(e) => setTopicWeight(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono"
                  >
                    <option value="1.0">100% (Core)</option>
                    <option value="0.85">85% (High)</option>
                    <option value="0.7">70% (Medium)</option>
                    <option value="0.5">50% (Optional)</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#172554] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E3A8A] transition-colors whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Topic
                </button>
              </div>
            </form>

            <form
              onSubmit={handleAddBulkTopics}
              className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-3"
            >
              <p className="text-xs font-semibold text-[#172554] flex items-center gap-1.5">
                <ListPlus className="h-4 w-4 text-[#2563EB]" />
                Bulk Import Syllabus Topics
              </p>
              <textarea
                rows={3}
                value={bulkTopicsText}
                onChange={(e) => setBulkTopicsText(e.target.value)}
                placeholder="Paste topics separated by new lines or commas..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[#16A34A] font-medium">
                  {bulkFeedback || ""}
                </span>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#172554] hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Import Topics
                </button>
              </div>
            </form>
          </div>

          {/* Syllabus Topics Table */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Topic</th>
                  <th className="py-2.5 px-3">Subject & Unit</th>
                  <th className="py-2.5 px-3 text-right">Exam Weight</th>
                  <th className="py-2.5 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTopics.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-xs text-slate-500"
                    >
                      No syllabus topics for this filter yet.
                    </td>
                  </tr>
                ) : (
                  filteredTopics.map((topic) => (
                    <tr
                      key={topic.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#0F172A]">
                          {topic.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {topic.origin === "sample"
                            ? "Sample Syllabus"
                            : "Added by You"}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        {topic.subject} · {topic.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-medium text-[#172554] tabular-nums">
                        {Math.round(topic.examWeight * 100)}%
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteTopic(topic.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Remove topic ${topic.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
