"use client";

import { cn } from "@/lib/utils";
import { useMailStore } from "@/stores/mail-store";

const tabs = [
  { id: "file" as const, label: "File" },
  { id: "home" as const, label: "Home" },
  { id: "view" as const, label: "View" },
  { id: "help" as const, label: "Help" },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useMailStore();

  return (
    <div className="flex items-center bg-[#252536] border-b border-[#333] shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "px-4 py-1.5 text-[13px] transition-colors",
            activeTab === tab.id
              ? "text-white border-b-2 border-[#0078d4] font-medium"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3a]"
          )}
          onClick={() => {
            if (tab.id !== "file") setActiveTab(tab.id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
