import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  RotateCcw,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";

export function SettingsPage() {
  const {
    profile,
    updateProfile,
    subjects,
    documents,
    deleteDocument,
    clearUserDocuments,
    includeSampleData,
    setIncludeSampleData,
    clearChatHistory,
    resetDemoState,
  } = useStudy();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [program, setProgram] = useState(profile.program);
  const [semester, setSemester] = useState(profile.semester);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const userDocs = documents.filter((d) => d.origin === "user");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, program, semester });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const togglePreferredSubject = (subj: string) => {
    const exists = profile.preferredSubjects.includes(subj);
    const updated = exists
      ? profile.preferredSubjects.filter((s) => s !== subj)
      : [...profile.preferredSubjects, subj];
    updateProfile({ preferredSubjects: updated });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your student profile, preferred subjects, study preferences,
          uploaded documents, and privacy controls.
        </p>
      </div>

      {/* Student Profile */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#172554]">
            <User className="h-4 w-4 text-[#2563EB]" />
            Student Profile
          </h2>
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Profile Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="student-name"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="student-email"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              University Email
            </label>
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="student-program"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Degree / Specialization
            </label>
            <input
              id="student-program"
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="student-semester"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Current Semester
            </label>
            <input
              id="student-semester"
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* Subject & Study Preferences */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-display text-base font-semibold text-[#172554] border-b border-slate-100 pb-3">
          Subject & Study Preferences
        </h2>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-slate-600">
            Preferred Focus Subjects
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {subjects.map((subj) => {
              const checked = profile.preferredSubjects.includes(subj);
              return (
                <label
                  key={subj}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] cursor-pointer hover:border-[#2563EB]/50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePreferredSubject(subj)}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="truncate">{subj}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label
              htmlFor="daily-reminder"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Daily Study Reminder Time
            </label>
            <input
              id="daily-reminder"
              type="time"
              value={profile.dailyReminderTime}
              onChange={(e) =>
                updateProfile({ dailyReminderTime: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-center space-y-2.5">
            <label className="flex items-center gap-2.5 text-sm text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={profile.groundedStrictMode}
                onChange={(e) =>
                  updateProfile({ groundedStrictMode: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
              />
              <span>Strict syllabus-only AI answers (block unverified claims)</span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={includeSampleData}
                onChange={(e) => setIncludeSampleData(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
              />
              <span>Include Sample CS/AIML Course Pack</span>
            </label>
          </div>
        </div>
      </section>

      {/* Uploaded Document Management */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#172554]">
              Uploaded Document Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {userDocs.length} personal document
              {userDocs.length === 1 ? "" : "s"} stored ·{" "}
              {documents.length - userDocs.length} sample document
              {documents.length - userDocs.length === 1 ? "" : "s"} visible
            </p>
          </div>

          {userDocs.length > 0 && !confirmDeleteAll && (
            <button
              type="button"
              onClick={() => setConfirmDeleteAll(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Uploaded Documents
            </button>
          )}

          {confirmDeleteAll && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-red-700">
                Delete all {userDocs.length} uploads?
              </span>
              <button
                type="button"
                onClick={() => {
                  clearUserDocuments();
                  setConfirmDeleteAll(false);
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(false)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {userDocs.length === 0 ? (
          <p className="text-sm text-slate-500 py-3">
            You haven't uploaded personal PDFs yet. Any PDFs you upload in My
            Library can also be deleted individually here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {userDocs.map((doc) => (
              <li
                key={doc.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-[#2563EB] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {doc.subject} · {doc.pageCount} pages · {doc.uploadDate}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteDocument(doc.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Privacy Settings */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#172554] border-b border-slate-100 pb-3">
          <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
          Privacy & Data Controls
        </h2>

        <label className="flex items-start gap-3 text-sm text-[#0F172A] cursor-pointer">
          <input
            type="checkbox"
            checked={profile.localOnlyStorage}
            onChange={(e) =>
              updateProfile({ localOnlyStorage: e.target.checked })
            }
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
          />
          <div>
            <p className="font-medium">
              Keep study history & uploaded document text in local browser
              storage
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Your documents are only sent to the AI endpoint during active Q&A
              or quiz generation requests.
            </p>
          </div>
        </label>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={clearChatHistory}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Clear Ask AI Chat History
          </button>
          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Workspace to Defaults
          </button>
        </div>
      </section>
    </div>
  );
}
