"use client";

import {
  Settings,
  Smile,
  Printer,
  Trash2,
  MoreHorizontal,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import type { Email } from "@/lib/mail-types";

interface EmailPreviewProps {
  email: Email | null;
}

function formatFullDate(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "numeric" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${weekday} ${month}/${day}/${year} ${time}`;
}

export function EmailPreview({ email }: EmailPreviewProps) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e2e] text-gray-500">
        <p className="text-sm">Select an email to read</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e2e] overflow-hidden">
      {/* Header bar - notification strip */}
      <div className="px-4 py-2 border-b border-[#333] bg-[#252536]">
        <p className="text-[12px] text-gray-300 truncate">
          {email.subject}
        </p>
      </div>

      {/* Email header */}
      <div className="px-4 py-3 border-b border-[#333]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-1">
              {email.from.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-white">
                  {email.from.name}
                </span>
              </div>
              <div className="text-[12px] text-gray-400 mt-1">
                <span className="text-gray-500">To:</span>{" "}
                {email.to.map((t, i) => (
                  <span key={i}>
                    {t.name} &lt;{t.email}&gt;
                    {i < email.to.length - 1 ? "; " : ""}
                  </span>
                ))}
              </div>
              {email.cc && email.cc.length > 0 && (
                <div className="text-[12px] text-gray-400">
                  <span className="text-gray-500">Cc:</span>{" "}
                  {email.cc.map((c, i) => (
                    <span key={i}>
                      {c.name} &lt;{c.email}&gt;
                      {i < email.cc!.length - 1 ? "; " : ""}
                    </span>
                  ))}
                  {email.cc.length > 2 && (
                    <span className="text-blue-400 cursor-pointer ml-1">
                      +{email.cc.length - 2} others
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Date and actions */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-4">
            <span className="text-[12px] text-gray-400 mr-2">
              {formatFullDate(email.date)}
            </span>
            <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
              <Settings size={16} />
            </button>
            <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
              <Smile size={16} />
            </button>
            <button className="p-1.5 hover:bg-[#333] rounded text-gray-400 border border-[#444] rounded-sm">
              <ExternalLink size={16} />
            </button>
            <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
              <Trash2 size={16} />
            </button>
            <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
              <Printer size={16} />
            </button>
            <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="flex items-center gap-2 mt-3 ml-[52px]">
            {email.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-[#2a2a3a] border border-[#444] rounded px-3 py-1.5 cursor-pointer hover:bg-[#333]"
              >
                <Paperclip size={14} className="text-gray-400" />
                <span className="text-[12px] text-gray-300 truncate max-w-[200px]">
                  {att.name}
                </span>
                <span className="text-[11px] text-gray-500">{att.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="text-[14px] text-gray-200 leading-relaxed max-w-[800px] mx-auto"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>
    </div>
  );
}
