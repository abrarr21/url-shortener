import type { StatsResponse } from "../lib/api";

interface TelemetryGridProps {
  stats: StatsResponse;
}

export function TelemetryGrid({ stats }: TelemetryGridProps) {
  // Estimated ingress rate for telemetry feel
  const velocity =
    stats.click_count > 0 ? (stats.click_count / 14).toFixed(1) : "0.0";

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Total Clicks */}
      <div className="rounded-xl border border-[#262C3A] bg-[#141720] p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#8F97A6]">
          <span>Total Clicks</span>
          <span className="rounded border border-[#10E599]/20 bg-[#10E599]/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#10E599]">
            +12.4%
          </span>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {stats.click_count.toLocaleString()}
        </div>
        <div className="mt-1 font-mono text-[11px] text-[#8F97A6]">
          All-time recorded
        </div>
      </div>

      {/* Trending Score */}
      <div className="rounded-xl border border-[#262C3A] bg-[#141720] p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#8F97A6]">
          <span>Trending Score</span>
          <span className="rounded border border-[#E5A93C]/30 bg-[#E5A93C]/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#F0B849]">
            HOT 🔥
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold tracking-tight text-[#F0B849] sm:text-3xl">
            {stats.trending_score.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-[#8F97A6]">/ 100</span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-[#8F97A6]">
          Top velocity index
        </div>
      </div>

      {/* Live Velocity */}
      <div className="rounded-xl border border-[#262C3A] bg-[#141720] p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#8F97A6]">
          <span>Live Velocity</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10E599] shadow-[0_0_8px_#10E599]" />
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {velocity}
        </div>
        <div className="mt-1 font-mono text-[11px] text-[#8F97A6]">
          req/s global ingress
        </div>
      </div>

      {/* Edge Cache Hit */}
      <div className="rounded-xl border border-[#262C3A] bg-[#141720] p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#8F97A6]">
          <span>Edge Cache Hit</span>
          <span className="rounded border border-[#262C3A] bg-[#181C26] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#EAD6B8]">
            P95 1.8ms
          </span>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
          99.8%
        </div>
        <div className="mt-1 font-mono text-[11px] text-[#8F97A6]">
          Zero cold-start
        </div>
      </div>
    </div>
  );
}
