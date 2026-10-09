import { Zap, Clock, ShieldCheck } from "lucide-react";

export function FeatureTrio() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#262C3A] pt-6 text-[#8F97A6] md:grid-cols-3">
      {/* Feature 1 */}
      <div className="flex items-start gap-3 rounded-xl border border-[#262C3A]/60 bg-[#0E1117]/60 p-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#262C3A] bg-[#181C26] font-bold text-[#F0B849]">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-display text-sm font-bold text-white">
            Ultra-fast Redirection
          </h4>
          <p className="mt-0.5 text-xs leading-relaxed text-[#8F97A6]">
            Average global round-trip latency under 4 milliseconds.
          </p>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="flex items-start gap-3 rounded-xl border border-[#262C3A]/60 bg-[#0E1117]/60 p-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#262C3A] bg-[#181C26] font-bold text-[#10E599]">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-display text-sm font-bold text-white">
            Real-time Clickstream
          </h4>
          <p className="mt-0.5 text-xs leading-relaxed text-[#8F97A6]">
            Live WebSocket telemetry broadcasts without polling.
          </p>
        </div>
      </div>

      {/* Feature 3 */}
      <div className="flex items-start gap-3 rounded-xl border border-[#262C3A]/60 bg-[#0E1117]/60 p-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#262C3A] bg-[#181C26] font-bold text-[#EAD6B8]">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-display text-sm font-bold text-white">
            Raft Quorum Proof
          </h4>
          <p className="mt-0.5 text-xs leading-relaxed text-[#8F97A6]">
            Distributed consistency guarantee across 3 continents.
          </p>
        </div>
      </div>
    </div>
  );
}
