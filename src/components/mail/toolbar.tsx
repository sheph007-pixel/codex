"use client";

import {
  Plus,
  Trash2,
  Archive,
  Flag,
  ShieldAlert,
  FolderInput,
  Reply,
  ReplyAll,
  Forward,
  Calendar,
  MessageSquare,
  Share2,
  Printer,
  MoreHorizontal,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onCompose: () => void;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onArchive: () => void;
  hasSelectedEmail: boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  primary,
  hasDropdown,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  hasDropdown?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] transition-colors whitespace-nowrap",
        primary
          ? "bg-[#0078d4] text-white hover:bg-[#106ebe]"
          : "text-gray-300 hover:bg-[#333] hover:text-white",
        disabled && "opacity-40 pointer-events-none"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon size={16} />
      <span>{label}</span>
      {hasDropdown && <ChevronDown size={12} className="ml-0.5 text-gray-400" />}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-[#444] mx-1" />;
}

export function Toolbar({
  onCompose,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  hasSelectedEmail,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-[#252536] border-b border-[#333] overflow-x-auto">
      <ToolbarButton icon={Plus} label="New mail" onClick={onCompose} primary hasDropdown />

      <ToolbarSeparator />

      <ToolbarButton icon={Trash2} label="Delete" onClick={onDelete} disabled={!hasSelectedEmail} hasDropdown />
      <ToolbarButton icon={Archive} label="Archive" onClick={onArchive} disabled={!hasSelectedEmail} />
      <ToolbarButton icon={Flag} label="Report" disabled={!hasSelectedEmail} hasDropdown />
      <ToolbarButton icon={ShieldAlert} label="Block" disabled={!hasSelectedEmail} hasDropdown />
      <ToolbarButton icon={FolderInput} label="Move to" disabled={!hasSelectedEmail} hasDropdown />

      <ToolbarSeparator />

      <ToolbarButton icon={Reply} label="Reply" onClick={onReply} disabled={!hasSelectedEmail} />
      <ToolbarButton icon={ReplyAll} label="Reply all" onClick={onReplyAll} disabled={!hasSelectedEmail} />
      <ToolbarButton icon={Forward} label="Forward" onClick={onForward} disabled={!hasSelectedEmail} hasDropdown />

      <ToolbarSeparator />

      <ToolbarButton icon={Calendar} label="Meeting" disabled={!hasSelectedEmail} />
      <ToolbarButton icon={MessageSquare} label="Chat" disabled={!hasSelectedEmail} hasDropdown />
      <ToolbarButton icon={Share2} label="Share to Teams" disabled={!hasSelectedEmail} />
      <ToolbarButton icon={ShieldCheck} label="Assign policy" disabled={!hasSelectedEmail} hasDropdown />
      <ToolbarButton icon={Printer} label="Print" disabled={!hasSelectedEmail} />

      <ToolbarSeparator />

      <ToolbarButton icon={MoreHorizontal} label="" disabled={false} />
    </div>
  );
}
