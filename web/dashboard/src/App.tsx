import { Route, Routes } from "react-router-dom";
import "./styles/index.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LinkPage } from "./pages/LinkPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

function App() {
  return (
    <div className="relative min-h-screen bg-[#0B0D11] text-[#E2E2E8] antialiased selection:bg-[#E5A93C] selection:text-[#0B0D11] flex flex-col">
      {/* Luxury Ambient Glow Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Subtle geometric dot grid */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(229, 169, 60, 0.45) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(75% 65% at 50% 30%, rgb(0, 0, 0) 40%, transparent 100%)",
          }}
        />
        {/* Amber and Emerald Photonic Glows */}
        <div className="absolute -top-[15%] left-1/2 h-[550px] w-[950px] -translate-x-1/2 bg-gradient-to-b from-[#E5A93C]/10 via-[#181C26]/20 to-transparent blur-[120px] opacity-70" />
        <div className="absolute top-[40%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[#E5A93C]/5 blur-[140px]" />
        <div className="absolute -bottom-[20%] right-[10%] h-[550px] w-[550px] rounded-full bg-[#10E599]/5 blur-[140px]" />
      </div>

      {/* Header */}
      <Header />

      {/* Main Container with generous margins */}
      <main className="relative z-10 pt-30 mx-auto flex-1 w-full max-w-6xl px-4 py-12 sm:px-8 lg:px-16">
        <Routes>
          <Route path="/" element={<LinkPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
