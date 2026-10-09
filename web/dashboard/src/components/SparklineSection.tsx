export function SparklineSection() {
  const bars = [
    { height: "20%", bg: "bg-[#262C3A]", label: "28 req/s" },
    { height: "25%", bg: "bg-[#262C3A]", label: "35 req/s" },
    { height: "30%", bg: "bg-[#262C3A]", label: "42 req/s" },
    { height: "45%", bg: "bg-[#333B4E]", label: "64 req/s" },
    { height: "55%", bg: "bg-[#333B4E]", label: "78 req/s" },
    { height: "65%", bg: "bg-[#8F97A6]", label: "92 req/s" },
    { height: "80%", bg: "bg-[#CFB17A]", label: "114 req/s" },
    { height: "85%", bg: "bg-[#E5A93C]/80", label: "121 req/s" },
    { height: "92%", bg: "bg-[#E5A93C]", label: "131 req/s" },
    {
      height: "100%",
      bg: "bg-[#F0B849] shadow-[0_0_10px_#F0B849]",
      label: "142.8 req/s",
    },
    { height: "88%", bg: "bg-[#E5A93C]", label: "125 req/s" },
    {
      height: "94%",
      bg: "bg-[#F0B849] shadow-[0_0_8px_#F0B849]",
      label: "134 req/s",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 border-t border-[#262C3A] pt-5 md:grid-cols-2">
      {/* 60-Min Ingress Sparkline */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-[#C8CDD6]">
            60-Min Ingress Sparkline
          </span>
          <span className="font-mono text-[11px] text-[#F0B849]">
            Peak: 142.8/s
          </span>
        </div>
        <div className="flex h-16 w-full items-end gap-1.5 rounded-xl border border-[#262C3A]/50 bg-[#0E1117]/60 p-2.5">
          {bars.map((bar, idx) => (
            <div
              key={idx}
              className={`w-1/12 rounded-t transition-colors hover:bg-[#FFC55A] ${bar.bg}`}
              style={{ height: bar.height }}
              title={bar.label}
            />
          ))}
        </div>
      </div>

      {/* Top Ingress Sources */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-[#C8CDD6]">
            Top Ingress Sources
          </span>
          <span className="font-mono text-[11px] text-[#8F97A6]">
            Total: 428.9k
          </span>
        </div>
        <div className="space-y-3 rounded-xl border border-[#262C3A]/50 bg-[#0E1117]/60 p-3 text-xs">
          <div>
            <div className="mb-1.5 flex justify-between font-medium text-[#8F97A6]">
              <span className="font-mono text-[#C8CDD6]">
                Hacker News (news.ycombinator.com)
              </span>
              <span className="font-mono font-bold text-[#F0B849]">42.9%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#181C26]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E5A93C] to-[#F0B849]"
                style={{ width: "42.9%" }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between font-medium text-[#8F97A6]">
              <span className="font-mono text-[#C8CDD6]">
                Twitter / X (@kubernetesio)
              </span>
              <span className="font-mono font-bold text-[#EAD6B8]">26.2%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#181C26]">
              <div
                className="h-full rounded-full bg-[#8F97A6]"
                style={{ width: "26.2%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
