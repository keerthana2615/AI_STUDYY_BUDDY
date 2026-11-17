import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { getDaysUntilExam } from "../utils/studyMath";
import { CitationPreviewModal } from "./CitationPreviewModal";

const AVATAR_URL = "/src/assets/images/avatar_student_profile_1794909906637.jpg";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/library", label: "My Library", icon: BookOpen },
  { to: "/ask", label: "Ask AI", icon: MessageSquareText },
  { to: "/quiz", label: "Quiz Practice", icon: ClipboardCheck },
  { to: "/progress", label: "My Progress", icon: TrendingUp },
  { to: "/planner", label: "Study Planner", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const {
    profile,
    documents,
    topics,
    topicMetrics,
    examConfig,
    aiStatus,
    includeSampleData,
    openCitationPreview,
  } = useStudy();
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const initials = useMemo(() => {
    return profile.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.name]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { docs: [], topics: [] };
    return {
      docs: documents
        .filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.subject.toLowerCase().includes(q)
        )
        .slice(0, 4),
      topics: topics
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q)
        )
        .slice(0, 4),
    };
  }, [searchQuery, documents, topics]);

  const notifications = useMemo(() => {
    const items: Array<{ id: string; title: string; detail: string; actionPath: string }> = [];
    const daysLeft = getDaysUntilExam(examConfig.examDate);
    items.push({
      id: "notif-exam",
      title: `Exam in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      detail: `Target exam date set to ${examConfig.examDate}. Review your weekly schedule.`,
      actionPath: "/planner",
    });

    const weakest = [...topicMetrics].sort((a, b) => a.mastery - b.mastery)[0];
    if (weakest) {
      items.push({
        id: "notif-weak",
        title: `Focus needed: ${weakest.topic.name}`,
        detail: `Current mastery is ${weakest.mastery}%. Try a 5-question practice quiz.`,
        actionPath: "/quiz",
      });
    }

    if (aiStatus === "offline") {
      items.push({
        id: "notif-ai",
        title: "Running in Demo Simulation Mode",
        detail:
          "Server AI key is not active; simulated Q&A and quizzes are clearly labelled.",
        actionPath: "/ask",
      });
    }
    return items;
  }, [examConfig.examDate, topicMetrics, aiStatus]);

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[#172554] text-white">
      {/* Brand Lockup */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M9 8h6" />
              <path d="M9 12h4" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-semibold tracking-tight text-white truncate">
              AI Study Buddy
            </div>
            <p className="text-[11px] text-blue-200/80 truncate">
              Learn Smarter. Track Better.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Bottom Workspace Indicator & Student Profile */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="px-2 text-xs text-blue-200/75">
          <span>
            {aiStatus === "live" ? "Syllabus AI Active" : "Demo Simulation Mode"}
          </span>
          <span aria-hidden="true"> · </span>
          <span>{includeSampleData ? "Sample + Yours" : "Your Data Only"}</span>
        </div>

        <NavLink
          to="/settings"
          onClick={() => setMobileNavOpen(false)}
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors"
        >
          {!avatarFailed ? (
            <img
              src={AVATAR_URL}
              alt={profile.name}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="h-9 w-9 rounded-full object-cover border border-white/20 shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile.name}
            </p>
            <p className="text-xs text-blue-200/75 truncate">
              {profile.program}
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F172A]/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full shadow-xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-blue-100 hover:bg-white/10"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-8 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1360px] mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="font-display text-sm sm:text-base font-semibold text-[#172554] truncate">
                  Welcome back, Student!
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                  placeholder="Search notes, subjects, or syllabus topics..."
                  className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] pl-9 pr-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-40">
                  {searchResults.docs.length === 0 &&
                  searchResults.topics.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-500">
                      No matching documents or topics found for “{searchQuery}”.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {searchResults.docs.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onMouseDown={() => {
                            openCitationPreview({ docId: doc.id, pageNumber: 1 });
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <FileText className="h-4 w-4 text-[#2563EB] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0F172A] truncate">
                              {doc.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {doc.subject} · {doc.pageCount} pages
                            </p>
                          </div>
                        </button>
                      ))}
                      {searchResults.topics.map((topic) => (
                        <button
                          key={topic.id}
                          type="button"
                          onMouseDown={() => {
                            navigate("/quiz");
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0F172A] truncate">
                              {topic.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              Syllabus Topic · {topic.subject}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Actions: Notifications & Profile Avatar */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-[#F8FAFC] hover:text-[#172554] transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  aria-label="Open notifications"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="sr-only">
                      {notifications.length} study alerts
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-40 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-sm font-semibold text-[#172554]">
                        Study Reminders
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Close
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(n.actionPath);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
                        >
                          <p className="text-sm font-medium text-[#0F172A]">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                            {n.detail}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                aria-label="Open student profile settings"
              >
                {!avatarFailed ? (
                  <img
                    src={AVATAR_URL}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#172554] text-xs font-semibold text-white">
                    {initials}
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-[1360px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <CitationPreviewModal />
    </div>
  );
}
