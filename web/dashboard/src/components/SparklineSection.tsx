interface SparklineSectionProps {
  samples: number[];
}

export function SparklineSection({ samples }: SparklineSectionProps) {
  const changes = samples.map((clicks, index) =>
    index === 0 ? 0 : Math.max(0, clicks - samples[index - 1]),
  );

  const peak = Math.max(...changes, 0);

  return (
    <div className="mt-6 border-t border-[#262C3A] pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#C8CDD6]">
            Live Click Activity
          </h3>
          <p className="mt-1 text-xs text-[#8F97A6]">
            Observed during this session · 2-second polling
          </p>
        </div>

        <span className="font-mono text-[11px] text-[#F0B849]">
          Peak: +{peak} clicks / sample
        </span>
      </div>

      <div
        className="flex h-24 items-end gap-1.5 overflow-hidden rounded-xl border border-[#262C3A]/50 bg-[#0E1117]/60 p-3"
        role="img"
        aria-label={`Recent observed click activity. Peak increase: ${peak} clicks per sample.`}
      >
        {changes.map((count, index) => {
          const height = peak === 0 ? 4 : Math.max(4, (count / peak) * 100);

          return (
            <div
              key={index}
              className={`min-w-0 flex-1 rounded-t transition-all duration-300 ${
                count > 0
                  ? "bg-[#F0B849] shadow-[0_0_8px_rgba(240,184,73,0.2)]"
                  : "bg-[#262C3A]"
              }`}
              style={{ height: `${height}%` }}
              title={`Sample ${index + 1}: ${count} new clicks`}
            />
          );
        })}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[#8F97A6]">
        This chart shows increases detected between polls, not historical
        traffic. Multiple clicks between polls are grouped together.
      </p>
    </div>
  );
}
