"use client";

import {
  Bell,
  Settings,
  HelpCircle,
  Menu,
} from "lucide-react";
import { SearchBar } from "./search-bar";

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
}

export function TopHeader({ searchQuery, onSearchChange, onToggleSidebar }: TopHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1a1a28] border-b border-[#333] h-[44px]">
      {/* Left: App name and hamburger */}
      <button className="p-1 hover:bg-[#333] rounded text-gray-400" onClick={onToggleSidebar}>
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold text-white">Outlook</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400 relative">
          <Bell size={18} />
        </button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
          <Settings size={18} />
        </button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
          <HelpCircle size={18} />
        </button>

        {/* Reminder card */}
        <div className="ml-3 flex items-center gap-2 bg-[#2a2a3a] rounded px-2 py-1 text-[11px] max-w-[220px]">
          <span className="text-gray-300 truncate">Hunter pick up Will from soccer</span>
          <span className="text-gray-500 whitespace-nowrap">Tomorrow 5:45 PM</span>
        </div>
      </div>
    </div>
  );
}
