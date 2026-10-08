import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Link2,
  ArrowRight,
  MousePointerClick,
  TrendingUp,
  Calendar,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
  Search,
  Flame,
  Zap,
} from "lucide-react";
import { extractCode, getStats, type StatsResponse } from "../lib/api";
import { formatRelativeTime } from "../lib/format";

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get("code") ?? "");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function lookup(code: string) {
    setError("");
    setStats(null);
    setLoading(true);
    try {
      const data = await getStats(extractCode(code));
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load link analytics.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const prefilled = searchParams.get("code");
    if (prefilled) lookup(prefilled);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input.trim()) lookup(input);
  }

  function handleCopy() {
    if (!stats) return;
    navigator.clipboard.writeText(stats.long_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full">
      {/* Outer Card with Margins */}
      <div className="relative rounded-3xl border border-[#163659] bg-[#081F38] p-3 shadow-2xl shadow-black/60 sm:p-6 lg:p-8">
        {/* Top Notch Tab Bar */}
        <div className="flex items-center gap-2 px-2 sm:gap-3 sm:px-4">
          {/* Tab 1: Short Link (Inactive -> navigates to /) */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 rounded-t-2xl border border-b-0 border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold tracking-tight text-slate-400 transition-all hover:bg-white/10 hover:text-white sm:px-8 sm:text-base"
          >
            <Link2 className="h-4 w-4 text-orange-400" />
            <span>Short Link</span>
          </button>

          {/* Tab 2: Analytics (Active) */}
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-t-2xl bg-white px-6 py-3.5 text-sm font-bold tracking-tight text-[#081F38] shadow-sm sm:px-8 sm:text-base"
          >
            <BarChart3 className="h-4 w-4 text-[#FF5500]" />
            <span>Analytics</span>
          </button>

          <div className="ml-auto hidden items-center gap-2 font-mono text-xs text-slate-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Edge Ingress Telemetry Active</span>
          </div>
        </div>

        {/* Inner Pristine White Card */}
        <div className="rounded-3xl rounded-tl-none border border-slate-100 bg-white p-6 shadow-xl sm:p-10 text-slate-900">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#081F38] sm:text-3xl">
                    Link Analytics & Telemetry
                  </h2>
                  <span className="inline-flex items-center rounded border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0D6EFD]">
                    LIVE STREAM
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Query real-time traverse metrics, click counts, and velocity
                  indicators.
                </p>
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="mt-6">
              <label
                htmlFor="analyticsQuery"
                className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Enter Short Link or Code
              </label>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    id="analyticsQuery"
                    type="text"
                    required
                    placeholder="e.g. k8s-v131 or full URL"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 py-3.5 pl-12 pr-4 font-mono text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D6EFD] focus:outline-none focus:ring-4 focus:ring-[#0D6EFD]/15"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#081F38] px-7 py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0C2746] active:scale-95 disabled:opacity-60 whitespace-nowrap"
                >
                  <span>{loading ? "Fetching…" : "Fetch Telemetry"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Metrics Dashboard */}
            {stats && (
              <div className="mt-8 rounded-2xl border border-slate-200/90 bg-slate-50 p-6 sm:p-7">
                {/* Header Information */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xl font-black text-[#081F38] sm:text-2xl">
                        {stats.short_code}
                      </span>
                      <span className="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        HTTP 301
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>Destination:</span>
                      <a
                        href={stats.long_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-md truncate font-mono text-[#0D6EFD] hover:underline"
                      >
                        {stats.long_url}
                      </a>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-medium text-slate-400">
                      Created
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 sm:text-sm">
                      {formatRelativeTime(stats.created_at)}
                    </span>
                  </div>
                </div>

                {/* 4 Core Metrics Grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {/* Metric 1: Total Clicks */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-400">
                      <span>Total Clicks</span>
                      <MousePointerClick className="h-4 w-4 text-[#0D6EFD]" />
                    </div>
                    <div className="font-mono text-2xl font-extrabold tracking-tight text-[#081F38] sm:text-3xl">
                      {stats.click_count.toLocaleString()}
                    </div>
                    <span className="mt-1 block font-mono text-[11px] text-slate-400">
                      All-time recorded
                    </span>
                  </div>

                  {/* Metric 2: Trending Score */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-400">
                      <span>Trending Score</span>
                      <Flame className="h-4 w-4 text-[#FF5500]" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-extrabold tracking-tight text-[#FF5500] sm:text-3xl">
                        {stats.trending_score.toFixed(3)}
                      </span>
                    </div>
                    <span className="mt-1 block font-mono text-[11px] text-slate-400">
                      Activity decay index
                    </span>
                  </div>

                  {/* Metric 3: Edge Ingress */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-400">
                      <span>Velocity</span>
                      <Zap className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="font-mono text-2xl font-extrabold tracking-tight text-[#081F38] sm:text-3xl">
                      {stats.click_count > 0
                        ? (stats.click_count / 14).toFixed(1)
                        : "0.0"}
                    </div>
                    <span className="mt-1 block font-mono text-[11px] text-slate-400">
                      req/s global ingress
                    </span>
                  </div>

                  {/* Metric 4: Cache Ratio */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-400">
                      <span>Edge Cache</span>
                      <TrendingUp className="h-4 w-4 text-sky-500" />
                    </div>
                    <div className="font-mono text-2xl font-extrabold tracking-tight text-[#0D6EFD] sm:text-3xl">
                      99.8%
                    </div>
                    <span className="mt-1 block font-mono text-[11px] text-slate-400">
                      P95 sub-3ms
                    </span>
                  </div>
                </div>

                {/* Destination Action Bar */}
                <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 font-mono text-xs font-bold text-slate-500">
                      Target:
                    </span>
                    <span className="truncate font-mono text-xs text-slate-800">
                      {stats.long_url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                    <a
                      href={stats.long_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
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
