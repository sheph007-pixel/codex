"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 bg-[#2a2a3a] border rounded px-3 py-1.5 flex-1 max-w-[500px] transition-colors ${
        focused ? "border-[#0078d4]" : "border-[#444]"
      }`}
    >
      <Search size={16} className="text-gray-400 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search"
        className="bg-transparent text-[13px] text-gray-200 outline-none flex-1 placeholder:text-gray-500"
      />
    </div>
  );
}
