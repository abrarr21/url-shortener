import { Route, Routes } from "react-router-dom";
import "./styles/index.css";
import { Header } from "./components/Header";
import { LinkPage } from "./pages/LinkPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050F1D] text-slate-100 antialiased selection:bg-[#FF5500] selection:text-white">
      {/* Redesigned Header */}
      <Header />

      {/* Main Container with Left and Right Margins */}
      <main className="mx-auto flex-1 w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        <Routes>
          <Route path="/" element={<LinkPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span>Quorum Distributed Consensus Link Infrastructure</span>
          <span>© 2026 Quorum. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
