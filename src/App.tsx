/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { StudyProvider } from "./context/StudyContext";
import { AskAiPage } from "./pages/AskAiPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ProgressPage } from "./pages/ProgressPage";
import { QuizPracticePage } from "./pages/QuizPracticePage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudyPlannerPage } from "./pages/StudyPlannerPage";

export default function App() {
  return (
    <StudyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/ask" element={<AskAiPage />} />
            <Route path="/quiz" element={<QuizPracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/planner" element={<StudyPlannerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StudyProvider>
  );
}
