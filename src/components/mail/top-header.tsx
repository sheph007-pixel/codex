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
    <div className="flex items-center h-[40px] bg-[#1b1b2f] border-b border-[#2a2a3d] px-2 gap-2 shrink-0">
      {/* Left: Logo + sidebar toggle */}
      <button
        className="p-1.5 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>
      <span className="text-[15px] font-semibold text-white tracking-tight select-none">
        Outlook
      </span>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-[600px] mx-auto">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[28px] pl-9 pr-3 text-[13px] bg-[#2a2a3d] border border-[#3a3a4d] rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions + reminder */}
      <div className="flex items-center gap-1">
        {/* Reminder card */}
        <div className="hidden xl:flex items-center gap-2 bg-[#2a2a3d] rounded px-3 py-1 mr-2 text-[11px]">
          <span className="text-gray-300 font-medium">Hunter pick up Will from soccer</span>
          <span className="text-[#0078d4]">Tomorrow 5:45 PM</span>
        </div>

        <button className="p-1.5 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors">
          <Bell size={16} />
        </button>
        <button className="p-1.5 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors">
          <Settings size={16} />
        </button>
        <button className="p-1.5 rounded hover:bg-[#2a2a3d] text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
}
