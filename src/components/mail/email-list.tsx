"use client";

import { Paperclip, Reply as ReplyIcon, ChevronDown, Star, Filter, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMailStore } from "@/stores/mail-store";
import { useGroupedEmails } from "@/hooks/use-emails";
import { emailAccounts } from "@/lib/mail-data";
import type { Email } from "@/lib/mail-types";
import { useState } from "react";

function formatTime(date: Date): string {
  const todayStart = new Date(2026, 2, 11);
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);

  if (date >= todayStart) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (date >= yesterdayStart || date >= weekStart) {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${time}`;
  }
  return (
    date.toLocaleDateString("en-US", { weekday: "short" }) +
    " " +
    date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
  );
}

function EmailRow({ email, isSelected, onSelect }: { email: Email; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2 cursor-pointer border-b border-[#2a2a3a] hover:bg-[#2a2a3a] min-h-[52px] transition-colors",
        isSelected && "bg-[#1a3a5c] hover:bg-[#1a3a5c] border-l-2 border-l-[#0078d4]",
        !isSelected && "border-l-2 border-l-transparent",
        !email.isRead && !isSelected && "bg-[#1e1e30]"
      )}
      onClick={onSelect}
    >
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
            {email.hasReplied && <ReplyIcon size={13} className="text-gray-500" />}
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

function findFolderName(folderId: string): string {
  for (const account of emailAccounts) {
    const name = findInFolders(account.folders, folderId);
    if (name) return name;
  }
  return "Inbox";
}

function findInFolders(
  folders: { id: string; name: string; children?: { id: string; name: string; children?: unknown[] }[] }[],
  targetId: string
): string | null {
  for (const f of folders) {
    if (f.id === targetId) return f.name;
    if (f.children) {
      const found = findInFolders(f.children as typeof folders, targetId);
      if (found) return found;
    }
  }
  return null;
}

export function EmailList() {
  const { selectedFolderId, selectedEmailId, setSelectedEmail, searchQuery } = useMailStore();
  const { grouped, isLoading } = useGroupedEmails(selectedFolderId, searchQuery);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const folderName = findFolderName(selectedFolderId);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] border-r border-[#333]">
      {/* Folder header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-white">{folderName}</span>
          <Star size={14} className="text-gray-500 cursor-pointer hover:text-yellow-400 transition-colors" />
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-1 hover:bg-[#333] rounded transition-colors" title="Filter">
            <Filter size={14} />
          </button>
          <button className="p-1 hover:bg-[#333] rounded transition-colors" title="Sort">
            <ArrowDownUp size={14} />
          </button>
          <span className="text-[12px] flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            By Date <ChevronDown size={12} />
          </span>
        </div>
      </div>

      {/* Email list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#0078d4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
            No emails found
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <div
                className="flex items-center gap-2 px-3 py-1 text-[12px] text-gray-400 cursor-pointer hover:text-white sticky top-0 bg-[#1e1e2e] z-10 transition-colors"
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
                    onSelect={() => setSelectedEmail(email.id)}
                  />
                ))}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
