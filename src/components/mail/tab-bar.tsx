"use client";

import { cn } from "@/lib/utils";

interface TabBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const tabs = [
  { id: "file", label: "File" },
  { id: "home", label: "Home" },
  { id: "view", label: "View" },
  { id: "help", label: "Help" },
];

export function TabBar({ activeTab, onSelectTab }: TabBarProps) {
  return (
    <div className="flex items-center bg-[#252536] border-b border-[#333]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "px-4 py-1.5 text-[13px] transition-colors",
            activeTab === tab.id
              ? "text-white border-b-2 border-[#0078d4] font-medium"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3a]"
          )}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
