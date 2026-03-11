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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useMailStore } from "@/stores/mail-store";
import { useEmail } from "@/hooks/use-emails";

function formatFullDate(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "numeric" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${weekday} ${month}/${day}/${year} ${time}`;
}

export function EmailPreview() {
  const { selectedEmailId } = useMailStore();
  const { data: email, isLoading } = useEmail(selectedEmailId);

  if (!selectedEmailId || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e2e] text-gray-500">
        <p className="text-sm">{isLoading ? "Loading..." : "Select an email to read"}</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e2e] text-gray-500">
        <p className="text-sm">Email not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] overflow-hidden min-w-0">
      {/* Scrollable content - everything scrolls together */}
      <ScrollArea className="flex-1">
        {/* Email header */}
        <div className="px-5 pt-4 pb-3">
          {/* Subject */}
          <h2 className="text-[16px] font-semibold text-white mb-3 leading-snug">{email.subject}</h2>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar
                fallback={email.from.name}
                size="lg"
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-semibold text-white">
                    {email.from.name}
                  </span>
                  <span className="text-[12px] text-gray-500">
                    {formatFullDate(email.date)}
                  </span>
                </div>
                <div className="text-[12px] text-gray-400 mt-0.5">
                  <span className="text-gray-500">To:</span>{" "}
                  {email.to.map((t, i) => (
                    <span key={i}>
                      {t.name}
                      {i < email.to.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
                {email.cc && email.cc.length > 0 && (
                  <div className="text-[12px] text-gray-400">
                    <span className="text-gray-500">Cc:</span>{" "}
                    {email.cc.map((c, i) => (
                      <span key={i}>
                        {c.name}
                        {i < email.cc!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 ml-3">
              <button className="p-1 hover:bg-[#333] rounded text-gray-500 transition-colors">
                <Smile size={15} />
              </button>
              <button className="p-1 hover:bg-[#333] rounded text-gray-500 transition-colors">
                <ExternalLink size={15} />
              </button>
              <button className="p-1 hover:bg-[#333] rounded text-gray-500 transition-colors">
                <Trash2 size={15} />
              </button>
              <button className="p-1 hover:bg-[#333] rounded text-gray-500 transition-colors">
                <Printer size={15} />
              </button>
              <button className="p-1 hover:bg-[#333] rounded text-gray-500 transition-colors">
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {email.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 bg-[#2a2a3a] border border-[#3a3a4d] rounded px-2.5 py-1 cursor-pointer hover:bg-[#333] transition-colors"
                >
                  <Paperclip size={13} className="text-gray-400" />
                  <span className="text-[12px] text-gray-300 truncate max-w-[180px]">
                    {att.name}
                  </span>
                  <span className="text-[11px] text-gray-500">{att.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#2a2a3a] mx-5" />

        {/* Email body */}
        <div className="px-5 py-4">
          <div
            className="text-[14px] text-gray-200 leading-relaxed max-w-[720px]"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
