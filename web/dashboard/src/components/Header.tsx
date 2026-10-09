import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Link2, Eye, Plus } from "lucide-react";

interface HeaderProps {
  onNewLinkClick?: () => void;
}

export function Header({ onNewLinkClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full border-b border-[#262C3A]/80 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B0D11]/60 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-[#0B0D11] shadow-none backdrop-blur-none"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <Link to="/" className="group flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F0B849] to-[#C9912A] text-[#0B0D11] shadow-lg shadow-black/60 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(240,184,73,0.45)]">
            <Link2 className="h-5 w-5" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              QUORUM
            </span>
            <span className="inline-flex items-center rounded border border-[#E5A93C]/30 bg-[#E5A93C]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#F0B849]">
              v1.0
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2.5 rounded-xl border border-[#262C3A] bg-[#141720] px-3.5 py-1.5 text-xs font-mono font-medium text-[#8F97A6] sm:inline-flex">
            <Eye className="h-3.5 w-3.5 shrink-0 text-[#F0B849]" />
            <span className="font-bold tracking-tight text-[#EAD6B8]">
              1,482,904
            </span>
          </div>

          <Link
            to="/"
            onClick={onNewLinkClick}
            className="gold-glow-btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F0B849] to-[#E5A93C] px-4 py-2.5 text-sm font-bold text-[#0B0D11] transition-all duration-200 hover:from-[#FFC55A] hover:to-[#F0B849] active:scale-95 sm:px-5"
          >
            <Plus className="h-4 w-4 text-[#0B0D11]" />
            <span className="font-display font-semibold tracking-tight">
              New Link
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
