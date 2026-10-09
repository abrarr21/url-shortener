import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Link2,
  ArrowRight,
  Copy,
  Check,
  BarChart3,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { shortenUrl, type ShortenResponse } from "../lib/api";
import { NotchTabs } from "../components/NotchTabs";
import { FeatureTrio } from "../components/FeatureTrio";

export function LinkPage() {
  const navigate = useNavigate();
  const [longUrl, setLongUrl] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Constructs functional redirect URL: /api/{short_code} hits the backend redirect route
  const shortLink = result
    ? `${window.location.origin}/${result.short_code}`
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
      setError(err instanceof Error ? err.message : "Failed to shorten link.");
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
      {/* Headline Intro */}
      <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
        <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#262C3A] bg-[#141720]/80 px-4 py-1.5 text-xs font-medium text-[#EAD6B8] shadow-inner backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10E599] shadow-[0_0_8px_#10E599]" />
          <span className="font-mono text-[11px] tracking-wide text-[#C8CDD6]">
            DISTRIBUTED SYSTEMS · ASYNC ANALYTICS
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white leading-[1.0] sm:text-5xl lg:text-6xl">
          Build stronger connections with{" "}
          <span className="gold-gradient-text">every click</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-[#8F97A6] sm:text-lg">
          Create recognizable short links and inspect real-time clickstream
          velocity across our distributed edge network.
        </p>
      </div>

      {/* Outer Container: Obsidian Noir with hairline border & velvet slate card */}
      <div className="relative rounded-3xl border border-[#262C3A] bg-[#0E1117] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.85)] sm:p-7 lg:p-10">
        {/* Top Notch Tabs Header */}
        <NotchTabs
          activeTab="shorten"
          onTabChange={(tab) => {
            if (tab === "analytics") navigate("/analytics");
          }}
        />

        {/* Tab 1 Content: Shorten a long link */}
        <div className="rounded-2xl border border-[#262C3A] bg-[#141720] p-6 text-white shadow-2xl sm:rounded-3xl sm:p-10">
          <div className="mx-auto max-w-4xl">
            {/* Header info */}
            <div className="flex flex-col justify-between gap-3 border-b border-[#262C3A] pb-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Shorten a long link
                </h2>
                <p className="mt-1 text-sm font-normal text-[#8F97A6]">
                  Fast redirects with asynchronous click analytics.
                </p>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="urlInput"
                className="mb-2.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#C8CDD6]"
              >
                Paste your destination URL
              </label>

              <div className="relative flex flex-col items-stretch gap-3 md:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#8F97A6]">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <input
                    id="urlInput"
                    type="url"
                    required
                    placeholder="https://github.com/kubernetes/kubernetes/releases/tag/v1.31.0"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="w-full rounded-xl border border-[#262C3A] bg-[#0E1117] py-4 pl-12 pr-4 font-mono text-base font-normal text-white shadow-inner placeholder-[#656D7E] focus:border-[#E5A93C] focus:outline-none focus:ring-2 focus:ring-[#E5A93C]/20 transition-all"
                  />
                </div>

                {/* Gold Glow Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="gold-glow-btn flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#F0B849] via-[#E5A93C] to-[#C9912A] px-8 py-4 font-display text-base font-bold text-[#0B0D11] transition-all duration-200 hover:from-[#FFC55A] hover:to-[#F0B849] active:scale-95 disabled:opacity-60"
                >
                  <span>
                    {loading ? "Shortening…" : "Get your link for free"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Sub-options */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#8F97A6]">
                <span className="font-mono text-[#C8CDD6]">
                  Custom domain:{" "}
                  <span className="text-[#F0B849]">{window.location.host}</span>
                </span>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Short Link Result Card */}
            {result && (
              <div className="mt-8 border-t border-[#262C3A] pt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8F97A6]">
                    Ready-to-use short link
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10E599]/30 bg-[#10E599]/10 px-3 py-1 font-mono text-xs font-semibold text-[#10E599]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10E599]" />
                    Link created successfully
                  </span>
                </div>

                <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#262C3A] bg-[#181C26] p-4 shadow-lg transition-all duration-300 hover:border-[#E5A93C]/40 sm:flex-row sm:items-center sm:p-5">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5A93C]/25 bg-[#E5A93C]/10 font-bold text-[#F0B849] shadow-inner">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={shortLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-mono text-lg font-bold text-[#F0B849] transition-colors hover:text-[#FFC55A] hover:underline sm:text-xl"
                        >
                          {shortLink}
                        </a>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#8F97A6]" />
                      </div>
                      <div className="mt-0.5 truncate font-mono text-xs text-[#8F97A6]">
                        Destination: {result.long_url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#262C3A] bg-[#141720] px-5 py-2.5 text-sm font-semibold text-[#EAD6B8] shadow-sm transition-all hover:border-[#E5A93C]/50 hover:text-white active:scale-95 sm:flex-none"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-[#10E599]" />
                          <span className="font-mono text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-[#F0B849]" />
                          <span className="font-mono text-xs">Copy</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/analytics?code=${result.short_code}`}
                      className="gold-glow-btn inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#E5A93C] px-4 py-2.5 text-sm font-bold text-[#0B0D11] shadow-sm transition-all hover:bg-[#FFC55A] active:scale-95 sm:flex-none"
                    >
                      <BarChart3 className="h-4 w-4 text-[#0B0D11]" />
                      <span className="font-display font-semibold">
                        Inspect Metrics
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Badges Trio */}
            <FeatureTrio />
          </div>
        </div>
      </div>
    </div>
  );
}
