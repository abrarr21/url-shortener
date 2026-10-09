import type { StatsResponse } from "../lib/api";

interface TelemetryGridProps {
  stats: StatsResponse;
}

export function TelemetryGrid({ stats }: TelemetryGridProps) {
  const ageInHours = Math.max(
    (Date.now() - new Date(stats.created_at).getTime()) / 3_600_000,
    0,
  );

  const averageClicksPerHour =
    ageInHours > 0 ? stats.click_count / ageInHours : 0;

  const metrics = [
    {
      label: "Total Clicks",
      value: stats.click_count.toLocaleString(),
      description: "All-time recorded redirects",
      valueClass: "text-white",
    },
    {
      label: "Trending Score",
      value: stats.trending_score.toFixed(3),
      description: "Time-decayed popularity score",
      valueClass: "text-[#F0B849]",
    },
    {
      label: "Average Clicks / Hour",
      value: averageClicksPerHour.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      }),
      description: "Lifetime average since creation",
      valueClass: "text-white",
    },
    {
      label: "Link Age",
      value:
        ageInHours < 1
          ? `${Math.floor(ageInHours * 60)}m`
          : ageInHours < 24
            ? `${Math.floor(ageInHours)}h`
            : `${Math.floor(ageInHours / 24)}d`,
      description: new Date(stats.created_at).toLocaleString(),
      valueClass: "text-white",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="min-w-0 rounded-xl border border-[#262C3A] bg-[#141720] p-4 shadow-sm"
        >
          <div className="mb-2 text-xs font-medium text-[#8F97A6]">
            {metric.label}
          </div>

          <div
            className={`break-words font-display text-2xl font-bold tracking-tight sm:text-3xl ${metric.valueClass}`}
          >
            {metric.value}
          </div>

          <div
            className="mt-2 break-words font-mono text-[10px] leading-relaxed text-[#8F97A6]"
            title={metric.description}
          >
            {metric.description}
          </div>
        </div>
      ))}
    </div>
  );
}
