"use client";

import { useState } from "react";
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  AlertOctagon,
  Archive,
  StickyNote,
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Users,
  Rss,
  Search,
  Mail,
  MailOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMailStore } from "@/stores/mail-store";
import type { EmailFolder } from "@/lib/mail-types";
import { emailAccounts, favoritesFolders } from "@/lib/mail-data";

function getFolderIcon(folder: EmailFolder, isOpen: boolean) {
  const size = 16;
  switch (folder.type) {
    case "inbox":
      return <Inbox size={size} className="text-blue-400" />;
    case "sent":
      return <Send size={size} className="text-blue-400" />;
    case "drafts":
      return <FileText size={size} className="text-blue-400" />;
    case "deleted":
      return <Trash2 size={size} className="text-blue-400" />;
    case "junk":
      return <AlertOctagon size={size} className="text-blue-400" />;
    case "archive":
      return <Archive size={size} className="text-blue-400" />;
    case "notes":
      return <StickyNote size={size} className="text-yellow-400" />;
    case "outbox":
      return <MailOpen size={size} className="text-blue-400" />;
    default:
      if (folder.children && folder.children.length > 0) {
        return isOpen ? (
          <FolderOpen size={size} className="text-yellow-500" />
        ) : (
          <Folder size={size} className="text-yellow-500" />
        );
      }
      return <Folder size={size} className="text-yellow-500" />;
  }
}

function getFavIcon(fav: (typeof favoritesFolders)[0]) {
  const size = 16;
  if (fav.flagIcon === "star") {
    return <Star size={size} className="text-red-400 fill-red-400" />;
  }
  if (fav.color) {
    return <Folder size={size} style={{ color: fav.color }} />;
  }
  return <Folder size={size} className="text-yellow-500" />;
}

function getSpecialIcon(name: string) {
  const size = 16;
  if (name === "Conversation History") return <Mail size={size} className="text-blue-400" />;
  if (name === "RSS Subscriptions") return <Rss size={size} className="text-orange-400" />;
  if (name === "Search Folders") return <Search size={size} className="text-blue-400" />;
  if (name === "Go to Groups") return <Users size={size} className="text-blue-400" />;
  if (name === "Snoozed") return <Clock size={size} className="text-blue-400" />;
  return null;
}

function FolderItem({
  folder,
  depth,
}: {
  folder: EmailFolder;
  depth: number;
}) {
  const { selectedFolderId, setSelectedFolder, collapsedSections, toggleSection } = useMailStore();
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = folder.id === selectedFolderId;
  const isOpen = !!(hasChildren && !collapsedSections[folder.id]);

  if (folder.name === "--------") {
    return <div className="border-t border-[#333] my-1 mx-4" />;
  }

  const specialIcon = getSpecialIcon(folder.name);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-[3px] cursor-pointer text-[13px] hover:bg-[#2a2a3a] group transition-colors",
          isSelected && "bg-[#0078d4] hover:bg-[#0069bf]"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          setSelectedFolder(folder.id);
          if (hasChildren) toggleSection(folder.id);
        }}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {isOpen ? (
              <ChevronDown size={12} className="text-gray-400" />
            ) : (
              <ChevronRight size={12} className="text-gray-400" />
            )}
          </span>
        ) : (
          <span className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="flex-shrink-0">
          {specialIcon || getFolderIcon(folder, isOpen)}
        </span>
        <span className="truncate flex-1 ml-1">{folder.name}</span>
        {folder.unreadCount && folder.unreadCount > 0 && (
          <span className="text-[11px] text-blue-400 font-semibold ml-auto">
            {folder.unreadCount}
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderSidebar() {
  const { selectedFolderId, setSelectedFolder } = useMailStore();
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({
    hunter: true,
    sheph007: true,
  });

  const toggleAccount = (id: string) => {
    setExpandedAccounts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ScrollArea className="h-full bg-[#1e1e2e] text-[#cccccc] border-r border-[#333] select-none">
      {/* Favorites */}
      <div className="mt-1">
        <div className="flex items-center gap-1 px-2 py-[3px] cursor-pointer hover:bg-[#2a2a3a]">
          <ChevronDown size={12} className="text-gray-400 ml-1" />
          <span className="font-semibold text-[13px] ml-1">Favorites</span>
        </div>
        {favoritesFolders.map((fav) => {
          if (fav.name === "--------") {
            return <div key={fav.id} className="border-t border-[#333] my-1 mx-4" />;
          }
          return (
            <div
              key={fav.id}
              className={cn(
                "flex items-center gap-1 px-2 py-[3px] cursor-pointer hover:bg-[#2a2a3a] text-[13px] transition-colors",
                selectedFolderId === fav.linkedFolderId && "bg-[#0078d4] hover:bg-[#0069bf]"
              )}
              style={{ paddingLeft: "28px" }}
              onClick={() => setSelectedFolder(fav.linkedFolderId)}
            >
              {getFavIcon(fav)}
              <span className="truncate ml-1">{fav.name}</span>
            </div>
          );
        })}
      </div>

      {/* Account folders */}
      {emailAccounts.map((account) => (
        <div key={account.id} className="mt-2">
          <div
            className="flex items-center gap-1 px-2 py-[3px] cursor-pointer hover:bg-[#2a2a3a]"
            onClick={() => toggleAccount(account.id)}
          >
            {expandedAccounts[account.id] ? (
              <ChevronDown size={12} className="text-gray-400 ml-1" />
            ) : (
              <ChevronRight size={12} className="text-gray-400 ml-1" />
            )}
            <span className="font-semibold text-[13px] ml-1">{account.displayName}</span>
          </div>
          {expandedAccounts[account.id] &&
            account.folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                depth={1}
              />
            ))}
        </div>
      ))}

      {/* Add account */}
      <div className="mt-2 mb-4">
        <div className="flex items-center gap-2 px-4 py-[3px] cursor-pointer hover:bg-[#2a2a3a] text-blue-400">
          <Mail size={14} />
          <span className="text-[12px]">Add account</span>
        </div>
      </div>
    </ScrollArea>
  );
}
