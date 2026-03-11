"use client";

import { Paperclip, Reply, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Email } from "@/lib/mail-types";
import { groupEmailsByDate } from "@/lib/mail-data";
import { useState } from "react";

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  folderName: string;
}

function formatTime(date: Date): string {
  const now = new Date(2026, 2, 11);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);

  if (date >= todayStart) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (date >= yesterdayStart) {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${time}`;
  }
  if (date >= weekStart) {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${time}`;
  }
  return date.toLocaleDateString("en-US", { weekday: "short" }) + " " +
    date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
}

function EmailRow({
  email,
  isSelected,
  onSelect,
}: {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2 cursor-pointer border-b border-[#2a2a3a] hover:bg-[#2a2a3a] min-h-[52px]",
        isSelected && "bg-[#1a3a5c] hover:bg-[#1a3a5c] border-l-2 border-l-[#0078d4]",
        !isSelected && "border-l-2 border-l-transparent",
        !email.isRead && "bg-[#1e1e30]"
      )}
      onClick={onSelect}
    >
      {/* Left color indicator for unread */}
      <div className="flex flex-col flex-1 min-w-0 gap-[2px]">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[13px] truncate",
              !email.isRead ? "font-semibold text-white" : "text-[#cccccc]",
              email.from.name === "Hunter Shepherd" && "text-blue-400"
            )}
          >
            {email.from.name}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {email.hasAttachment && <Paperclip size={13} className="text-gray-500" />}
            {email.hasReplied && <Reply size={13} className="text-gray-500" />}
            <span className="text-[11px] text-gray-400 whitespace-nowrap ml-1">
              {formatTime(email.date)}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "text-[13px] truncate",
            !email.isRead ? "font-semibold text-white" : "text-[#aaaaaa]"
          )}
        >
          {email.subject}
        </div>
      </div>
    </div>
  );
}

export function EmailList({ emails, selectedEmailId, onSelectEmail, folderName }: EmailListProps) {
  const groups = groupEmailsByDate(emails);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] border-r border-[#333]">
      {/* Folder header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-white">{folderName}</span>
          <Star size={14} className="text-gray-500 cursor-pointer hover:text-yellow-400" />
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-1 hover:bg-[#333] rounded" title="Filter">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2h14l-5.5 6.5V14l-3-2V8.5L1 2z" />
            </svg>
          </button>
          <button className="p-1 hover:bg-[#333] rounded" title="Sort">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 4h10M5 8h6M7 12h2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <span className="text-[12px] flex items-center gap-1 cursor-pointer hover:text-white">
            By Date <ChevronDown size={12} />
          </span>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div
              className="flex items-center gap-2 px-3 py-1 text-[12px] text-gray-400 cursor-pointer hover:text-white sticky top-0 bg-[#1e1e2e] z-10"
              onClick={() => toggleGroup(group.label)}
            >
              <ChevronDown
                size={12}
                className={cn(
                  "transition-transform",
                  collapsedGroups[group.label] && "-rotate-90"
                )}
              />
              <span className="font-semibold">{group.label}</span>
            </div>
            {!collapsedGroups[group.label] &&
              group.emails.map((email) => (
                <EmailRow
                  key={email.id}
                  email={email}
                  isSelected={email.id === selectedEmailId}
                  onSelect={() => onSelectEmail(email.id)}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Star({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
