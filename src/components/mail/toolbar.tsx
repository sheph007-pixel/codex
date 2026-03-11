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
import { useMailStore } from "@/stores/mail-store";
import { useDeleteEmail, useArchiveEmail } from "@/hooks/use-emails";

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
      {label && <span>{label}</span>}
      {hasDropdown && <ChevronDown size={12} className="ml-0.5 text-gray-400" />}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-[#444] mx-1" />;
}

export function Toolbar() {
  const { selectedEmailId, openCompose, setSelectedEmail } = useMailStore();
  const deleteEmail = useDeleteEmail();
  const archiveEmail = useArchiveEmail();
  const hasSelected = !!selectedEmailId;

  const handleDelete = () => {
    if (selectedEmailId) {
      deleteEmail.mutate(selectedEmailId);
      setSelectedEmail(null);
    }
  };

  const handleArchive = () => {
    if (selectedEmailId) {
      archiveEmail.mutate(selectedEmailId);
      setSelectedEmail(null);
    }
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-[#252536] border-b border-[#333] overflow-x-auto shrink-0">
      <ToolbarButton icon={Plus} label="New mail" onClick={() => openCompose("new")} primary hasDropdown />
      <ToolbarSeparator />
      <ToolbarButton icon={Trash2} label="Delete" onClick={handleDelete} disabled={!hasSelected} hasDropdown />
      <ToolbarButton icon={Archive} label="Archive" onClick={handleArchive} disabled={!hasSelected} />
      <ToolbarButton icon={Flag} label="Report" disabled={!hasSelected} hasDropdown />
      <ToolbarButton icon={ShieldAlert} label="Block" disabled={!hasSelected} hasDropdown />
      <ToolbarButton icon={FolderInput} label="Move to" disabled={!hasSelected} hasDropdown />
      <ToolbarSeparator />
      <ToolbarButton icon={Reply} label="Reply" onClick={() => openCompose("reply")} disabled={!hasSelected} />
      <ToolbarButton icon={ReplyAll} label="Reply all" onClick={() => openCompose("replyAll")} disabled={!hasSelected} />
      <ToolbarButton icon={Forward} label="Forward" onClick={() => openCompose("forward")} disabled={!hasSelected} hasDropdown />
      <ToolbarSeparator />
      <ToolbarButton icon={Calendar} label="Meeting" disabled={!hasSelected} />
      <ToolbarButton icon={MessageSquare} label="Chat" disabled={!hasSelected} hasDropdown />
      <ToolbarButton icon={Share2} label="Share to Teams" disabled={!hasSelected} />
      <ToolbarButton icon={ShieldCheck} label="Assign policy" disabled={!hasSelected} hasDropdown />
      <ToolbarButton icon={Printer} label="Print" disabled={!hasSelected} />
      <ToolbarSeparator />
      <ToolbarButton icon={MoreHorizontal} label="" disabled={false} />
    </div>
  );
}
