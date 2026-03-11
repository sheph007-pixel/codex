"use client";

import {
  Search,
  Settings,
  Bell,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useMailStore } from "@/stores/mail-store";

export function TopHeader() {
  const { searchQuery, setSearchQuery, sidebarOpen, setSidebarOpen } = useMailStore();

  return (
    <div className="flex items-center h-[36px] bg-[#1b1b2f] border-b border-[#2a2a3d] px-2 gap-2 shrink-0">
      {/* Left: sidebar toggle + logo */}
      <button
        className="p-1 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>
      <span className="text-[14px] font-semibold text-white tracking-tight select-none">
        Mail
      </span>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-[520px] mx-auto">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search mail"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[26px] pl-8 pr-3 text-[13px] bg-[#2a2a3d] border border-[#3a3a4d] rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5">
        <button className="p-1 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors">
          <Bell size={15} />
        </button>
        <button className="p-1 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors">
          <Settings size={15} />
        </button>
        <button className="p-1 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={15} />
        </button>
      </div>
    </div>
  );
}
