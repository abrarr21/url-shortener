import { useLocation, useNavigate } from "react-router-dom";
import "./styles/index.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LinkPage } from "./pages/LinkPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAnalytics = location.pathname.startsWith("/analytics");

  return (
    <div className="relative min-h-screen bg-[#0B0D11] text-[#E2E2E8] antialiased selection:bg-[#E5A93C] selection:text-[#0B0D11] flex flex-col">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="pointer-events-none dot-pattern absolute inset-0 z-0" />
        <div className="absolute -top-[15%] left-1/2 h-[550px] w-[950px] -translate-x-1/2 bg-gradient-to-b from-[#E5A93C]/10 via-[#181C26]/20 to-transparent blur-[120px] opacity-70" />
      </div>

      <Header onNewLinkClick={() => navigate("/")} />

      <main className="relative pt-30 z-10 mx-auto flex-1 w-full max-w-6xl px-4 py-12 sm:px-8 lg:px-16">
        {/* Both pages stay mounted in the DOM. Switching tabs simply toggles visibility */}
        <div className={isAnalytics ? "hidden" : "block"}>
          <LinkPage />
        </div>
        <div className={isAnalytics ? "block" : "hidden"}>
          <AnalyticsPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
