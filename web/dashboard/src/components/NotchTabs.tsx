import { Link2, BarChart3 } from "lucide-react";

export type TabType = "shorten" | "analytics";

interface NotchTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  edgePopsCount?: number;
}

export function NotchTabs({
  activeTab,
  onTabChange,
  edgePopsCount = 12,
}: NotchTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[#262C3A] px-2 sm:gap-3 sm:px-4">
      {/* Tab 1: Short Link */}
      <button
        type="button"
        onClick={() => onTabChange("shorten")}
        className={`flex items-center gap-2.5 rounded-t-2xl px-6 py-3.5 text-sm font-bold tracking-tight transition-all duration-200 sm:px-8 sm:text-base ${
          activeTab === "shorten"
            ? "border border-[#262C3A] border-b-2 border-b-[#E5A93C] bg-gradient-to-b from-[#181C26] to-[#141720] text-[#F0B849] shadow-[0_-4px_18px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(229,169,60,0.2)]"
            : "border border-transparent border-b-[#262C3A] bg-[#0E1117]/60 text-[#8F97A6] hover:border-[#262C3A]/60 hover:bg-[#181C26]/60 hover:text-[#EAD6B8]"
        }`}
      >
        <Link2
          className={`h-4 w-4 ${
            activeTab === "shorten" ? "text-[#F0B849]" : "text-[#8F97A6]"
          }`}
        />
        <span className="font-display">Short Link</span>
      </button>

      {/* Tab 2: Analytics */}
      <button
        type="button"
        onClick={() => onTabChange("analytics")}
        className={`flex items-center gap-2.5 rounded-t-2xl px-6 py-3.5 text-sm font-bold tracking-tight transition-all duration-200 sm:px-8 sm:text-base ${
          activeTab === "analytics"
            ? "border border-[#262C3A] border-b-2 border-b-[#E5A93C] bg-gradient-to-b from-[#181C26] to-[#141720] text-[#F0B849] shadow-[0_-4px_18px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(229,169,60,0.2)]"
            : "border border-transparent border-b-[#262C3A] bg-[#0E1117]/60 text-[#8F97A6] hover:border-[#262C3A]/60 hover:bg-[#181C26]/60 hover:text-[#EAD6B8]"
        }`}
      >
        <BarChart3
          className={`h-4 w-4 ${
            activeTab === "analytics" ? "text-[#F0B849]" : "text-[#8F97A6]"
          }`}
        />
        <span className="font-display">Analytics</span>
      </button>

      {/* Right side live status indicator */}
      <div className="ml-auto hidden items-center gap-2 pb-2 font-mono text-xs text-[#8F97A6] sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10E599] shadow-[0_0_6px_#10E599]" />
        <span>
          Edge PoPs:{" "}
          <span className="font-semibold text-[#EAD6B8]">
            {edgePopsCount} Synced
          </span>
        </span>
      </div>
    </div>
  );
}
