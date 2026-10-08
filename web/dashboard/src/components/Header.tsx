import { Link } from "react-router-dom";
import { Link2, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050F1D]/80 backdrop-blur-md">
      {/* Responsive left and right margins */}
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity: Orange Link Icon + Crisp Typography */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5500] text-white shadow-lg shadow-orange-500/25 transition-transform duration-200 group-hover:scale-105">
            <Link2 className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-2xl font-extrabold tracking-tight text-white">
              QUORUM
            </span>
            <span className="inline-flex items-center rounded border border-[#FF5500]/30 bg-[#FF5500]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF5500]">
              v0.1
            </span>
          </div>
        </Link>

        {/* Right Action Button (Navigation links removed) */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5500] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-[#EA4C00] hover:shadow-orange-500/35 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Link</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
