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
  MoreHorizontal,
  ChevronDown,
  Tag,
  Clock,
  MailOpen,
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
  hideLabel,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  hasDropdown?: boolean;
  hideLabel?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-[13px] transition-colors whitespace-nowrap",
        primary
          ? "bg-[#0078d4] text-white hover:bg-[#106ebe] px-3"
          : "text-gray-300 hover:bg-[#333] hover:text-white",
        disabled && "opacity-40 pointer-events-none"
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon size={15} />
      {!hideLabel && label && <span>{label}</span>}
      {hasDropdown && <ChevronDown size={10} className="text-gray-400" />}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-[#3a3a4d] mx-0.5" />;
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
    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-[#252536] border-b border-[#333] shrink-0">
      <ToolbarButton icon={Plus} label="Compose" onClick={() => openCompose("new")} primary />
      <ToolbarSeparator />
      <ToolbarButton icon={Archive} label="Archive" onClick={handleArchive} disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={Trash2} label="Delete" onClick={handleDelete} disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={Flag} label="Report" disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={ShieldAlert} label="Block" disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={FolderInput} label="Move to" disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={Tag} label="Label" disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={Clock} label="Snooze" disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={MailOpen} label="Mark read" disabled={!hasSelected} hideLabel />
      <ToolbarSeparator />
      <ToolbarButton icon={Reply} label="Reply" onClick={() => openCompose("reply")} disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={ReplyAll} label="Reply all" onClick={() => openCompose("replyAll")} disabled={!hasSelected} hideLabel />
      <ToolbarButton icon={Forward} label="Forward" onClick={() => openCompose("forward")} disabled={!hasSelected} hideLabel />
      <ToolbarSeparator />
      <ToolbarButton icon={MoreHorizontal} label="More" disabled={false} hideLabel />
    </div>
  );
}
