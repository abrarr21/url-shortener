import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Link2,
  BarChart3,
  ArrowRight,
  Copy,
  Check,
  Star,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { shortenUrl, type ShortenResponse } from "../lib/api";

export function LinkPage() {
  const navigate = useNavigate();
  const [longUrl, setLongUrl] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortLink = result
    ? `${window.location.origin}/api/${result.short_code}`
    : "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await shortenUrl(longUrl);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not shorten link.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!shortLink) return;
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full">
      {/* Intro Hero Heading */}
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>Distributed Anycast Mesh · Raft Consensus Verified</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Build stronger connections with{" "}
          <span className="bg-gradient-to-r from-orange-400 via-[#FF5500] to-amber-300 bg-clip-text text-transparent">
            every click
          </span>
        </h1>
        <p className="mt-4 text-base font-normal text-slate-400 sm:text-lg">
          Create recognizable short links and inspect real-time clickstream
          velocity across our distributed edge network.
        </p>
      </div>

      {/* Outer Card: Generous Margins, Deep Navy Blue (#081F38), Rounded-3xl */}
      <div className="relative rounded-3xl border border-[#163659] bg-[#081F38] p-3 shadow-2xl shadow-black/60 sm:p-6 lg:p-8">
        {/* Top Notch Tab Bar: Short Link & Analytics */}
        <div className="flex items-center gap-2 px-2 sm:gap-3 sm:px-4">
          {/* Tab 1: Short Link (Active) */}
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-t-2xl bg-white px-6 py-3.5 text-sm font-bold tracking-tight text-[#081F38] shadow-sm sm:px-8 sm:text-base"
          >
            <Link2 className="h-4 w-4 text-[#FF5500]" />
            <span>Short Link</span>
          </button>

          {/* Tab 2: Analytics (Inactive -> routes to /analytics) */}
          <button
            type="button"
            onClick={() => navigate("/analytics")}
            className="flex items-center gap-2.5 rounded-t-2xl border border-b-0 border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold tracking-tight text-slate-400 transition-all hover:bg-white/10 hover:text-white sm:px-8 sm:text-base"
          >
            <BarChart3 className="h-4 w-4 text-sky-400" />
            <span>Analytics</span>
          </button>

          {/* Live Node Telemetry Indicator */}
          <div className="ml-auto hidden items-center gap-2 font-mono text-xs text-slate-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Edge PoPs: 12 Synced</span>
          </div>
        </div>

        {/* Inner Pristine White Card */}
        <div className="rounded-3xl rounded-tl-none border border-slate-100 bg-white p-6 shadow-xl sm:p-10 text-slate-900">
          <div className="mx-auto max-w-4xl">
            {/* Heading and Social Proof Stars */}
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#081F38] sm:text-3xl">
                  Shorten a long link
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Instant Anycast propagation with zero cold-start latency.
                </p>
              </div>

              {/* Social Proof Stars Badge */}
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200/80 bg-amber-50/80 px-3.5 py-1.5 sm:self-auto">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-current text-amber-500"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold tracking-tight text-amber-900">
                  4.9 / 5 · Loved by 18,000+ engineers
                </span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="urlInput"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Paste your destination URL
              </label>

              <div className="flex flex-col items-stretch gap-3 md:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <input
                    id="urlInput"
                    type="url"
                    required
                    placeholder="https://example.com/my-long-url-path"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 py-4 pl-12 pr-4 font-mono text-base font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#0D6EFD] focus:outline-none focus:ring-4 focus:ring-[#0D6EFD]/15"
                  />
                </div>

                {/* Electric Blue CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0D6EFD] px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-[#0B5ED7] hover:shadow-blue-500/40 active:scale-95 disabled:opacity-60 whitespace-nowrap"
                >
                  <span>
                    {loading ? "Shortening…" : "Get your link for free"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Sub-options */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Auto Anycast routing
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  BLAKE3 collision-free
                </span>
                <Link
                  to="/analytics"
                  className="text-[#0D6EFD] hover:underline ml-auto font-semibold flex items-center gap-1"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Inspect an existing link's analytics</span>
                </Link>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Ready-to-Copy Result State */}
            {result && (
              <div className="mt-8 border-t border-slate-100 pt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ready-to-use short link
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active · Sub-3ms P95
                  </span>
                </div>

                <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:p-5">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/80 font-bold text-[#FF5500]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <a
                        href={shortLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate font-mono text-lg font-bold text-[#081F38] transition-colors hover:text-[#0D6EFD] sm:text-xl"
                      >
                        {shortLink}
                      </a>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        Destination: {result.long_url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:text-slate-900 active:scale-95 sm:flex-none"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/analytics?code=${result.short_code}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#081F38] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0C2746] active:scale-95 sm:flex-none"
                    >
                      <BarChart3 className="h-4 w-4 text-sky-400" />
                      <span>Inspect Metrics</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
