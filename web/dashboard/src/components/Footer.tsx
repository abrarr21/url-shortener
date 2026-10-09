export function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-[#262C3A]/80 pt-8 pb-10 text-xs font-mono text-[#8F97A6]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
          <span>© 2026 Quorum</span>
          <span className="hidden text-[#262C3A] sm:inline">|</span>
          <span>Built to explore distributed systems.</span>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/abrarr21/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://x.com/abrarrr_21"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Twitter / X
          </a>
        </div>
      </div>
    </footer>
  );
}
