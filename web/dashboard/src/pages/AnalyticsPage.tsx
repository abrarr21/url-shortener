import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, ExternalLink, AlertCircle, Copy, Check } from "lucide-react";
import { extractCode, getStats, type StatsResponse } from "../lib/api";
import { formatRelativeTime } from "../lib/format";
import { NotchTabs } from "../components/NotchTabs";
import { TelemetryGrid } from "../components/TelemetryGrid";

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get("code") ?? "");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(searchParams.get("code")));
  const [copiedUrl, setCopiedUrl] = useState(false);

  async function lookup(code: string) {
    setError("");
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

  // Load from search params on mount
  useEffect(() => {
    const prefilled = searchParams.get("code");
    if (!prefilled) return;

    let isMounted = true;
    getStats(extractCode(prefilled))
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load link analytics.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Real-time WebSocket connection
  useEffect(() => {
    if (!stats?.short_code) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.short_code === stats.short_code) {
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  click_count: data.click_count,
                  trending_score: data.score,
                }
              : null,
          );
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => ws.close();
  }, [stats?.short_code]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (input.trim()) {
      const cleaned = extractCode(input);
      setStats(null);
      setSearchParams({ code: cleaned });
      lookup(cleaned);
    }
  }

  function handlePresetClick(code: string) {
    setInput(code);
    setSearchParams({ code });
    lookup(code);
  }

  function handleCopyTarget() {
    if (!stats) return;
    navigator.clipboard.writeText(stats.long_url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  const isDev = window.location.port === "5173";
  const baseOrigin = isDev
    ? `${window.location.protocol}//${window.location.hostname}`
    : window.location.origin;

  return (
    <div className="w-full">
      {/* Outer Container */}
      <div className="relative rounded-3xl border border-[#262C3A] bg-[#0E1117] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.85)] sm:p-7 lg:p-10">
        <NotchTabs
          activeTab="analytics"
          onTabChange={(tab) => {
            if (tab === "shorten") navigate("/");
          }}
        />

        {/* Analytics Card */}
        <div className="rounded-2xl border border-[#262C3A] bg-[#141720] p-6 text-white shadow-2xl sm:rounded-3xl sm:p-10">
          <div className="mx-auto max-w-4xl">
            {/* Header info */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#262C3A] pb-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Link Analytics &amp; Telemetry
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded border border-[#10E599]/30 bg-[#10E599]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#10E599]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10E599]" />
                    LIVE STREAM
                  </span>
                </div>
                <p className="mt-1 text-sm font-normal text-[#8F97A6]">
                  Inspect live click counts, velocity score, and destination URL
                  in real time.
                </p>
              </div>
            </div>

            {/* Query Input */}
            <form onSubmit={handleSubmit} className="mt-6">
              <label
                htmlFor="analyticsQuery"
                className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#8F97A6]"
              >
                Enter Short Link or Code
              </label>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-mono text-sm font-semibold text-[#F0B849]">
                    /
                  </span>
                  <input
                    id="analyticsQuery"
                    type="text"
                    required
                    placeholder="e.g. R6fPov0RlY or full short URL"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full rounded-xl border border-[#262C3A] bg-[#0E1117] py-3.5 pl-10 pr-4 font-mono text-base font-semibold text-white shadow-inner focus:border-[#E5A93C] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="gold-glow-btn flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F0B849] via-[#E5A93C] to-[#C9912A] px-7 py-3.5 font-display font-bold text-[#0B0D11] shadow-md transition-all hover:from-[#FFC55A] hover:to-[#F0B849] active:scale-95 disabled:opacity-60 whitespace-nowrap"
                >
                  <Search className="h-4 w-4 text-[#0B0D11]" />
                  <span>{loading ? "Fetching…" : "View Analytics"}</span>
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Active Target Inspector Card */}
            {stats && (
              <div className="mt-8 rounded-2xl border border-[#262C3A] bg-[#181C26] p-6 shadow-xl sm:p-7">
                {/* Target header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262C3A] pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xl font-bold text-white sm:text-2xl">
                        {baseOrigin}/{stats.short_code}
                      </span>
                      <span className="rounded border border-[#E5A93C]/30 bg-[#E5A93C]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#F0B849]">
                        HTTP 302
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-[#8F97A6]">
                      <span>Destination:</span>
                      <a
                        href={stats.long_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-md truncate font-mono text-[#EAD6B8] transition-colors hover:text-[#F0B849] hover:underline"
                      >
                        {stats.long_url}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyTarget}
                        className="p-0.5 text-[#8F97A6] hover:text-white"
                        title="Copy target URL"
                      >
                        {copiedUrl ? (
                          <Check className="h-3.5 w-3.5 text-[#10E599]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={stats.long_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8F97A6] hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs text-[#8F97A6]">
                      Created Timestamp
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-semibold text-[#E2E2E8] sm:text-sm">
                      {formatRelativeTime(stats.created_at)}
                    </div>
                  </div>
                </div>

                {/* 4 Clean Metric Cards (Total Clicks, Trending Score, Avg Clicks/hr, Link Age) */}
                <TelemetryGrid stats={stats} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
