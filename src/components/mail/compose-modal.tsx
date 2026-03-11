"use client";

import { useState } from "react";
import {
  X,
  Minus,
  Maximize2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  Link,
  Image,
  Paperclip,
  MoreHorizontal,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: {
    from: { name: string; email: string };
    to: { name: string; email: string }[];
    cc?: { name: string; email: string }[];
    subject: string;
    body: string;
    date: Date;
  };
  mode?: "new" | "reply" | "replyAll" | "forward";
}

export function ComposeModal({ isOpen, onClose, replyTo, mode = "new" }: ComposeModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [to, setTo] = useState(() => {
    if (mode === "reply" && replyTo) return replyTo.from.email;
    if (mode === "replyAll" && replyTo) {
      const all = [replyTo.from.email, ...(replyTo.cc?.map((c) => c.email) || [])];
      return all.join("; ");
    }
    return "";
  });
  const [cc, setCc] = useState(() => {
    if (mode === "replyAll" && replyTo?.cc) return replyTo.cc.map((c) => c.email).join("; ");
    return "";
  });
  const [subject, setSubject] = useState(() => {
    if (!replyTo) return "";
    if (mode === "forward") return `Fw: ${replyTo.subject}`;
    if (mode === "reply" || mode === "replyAll") {
      return replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`;
    }
    return "";
  });
  const [body, setBody] = useState(() => {
    if (!replyTo) return "";
    if (mode === "forward" || mode === "reply" || mode === "replyAll") {
      return `\n\n-------- Original Message --------\nFrom: ${replyTo.from.name} <${replyTo.from.email}>\nDate: ${replyTo.date.toLocaleString()}\nSubject: ${replyTo.subject}\n\n`;
    }
    return "";
  });
  const [showCc, setShowCc] = useState(mode === "replyAll");

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col bg-[#1e1e2e] border border-[#444] shadow-2xl rounded-t-lg",
        isMaximized
          ? "inset-4"
          : "bottom-0 right-4 w-[560px] h-[480px]"
      )}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252536] border-b border-[#444] rounded-t-lg cursor-move">
        <span className="text-[13px] text-gray-300 font-medium">
          {mode === "new" ? "New Message" : mode === "reply" ? "Reply" : mode === "replyAll" ? "Reply All" : "Forward"}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-[#333] rounded text-gray-400"
            onClick={() => setIsMaximized(false)}
          >
            <Minus size={14} />
          </button>
          <button
            className="p-1 hover:bg-[#333] rounded text-gray-400"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            <Maximize2 size={14} />
          </button>
          <button
            className="p-1 hover:bg-[#333] rounded text-gray-400"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="border-b border-[#333]">
        <div className="flex items-center px-3 py-1.5 border-b border-[#2a2a3a]">
          <span className="text-[12px] text-gray-500 w-10 flex-shrink-0">To</span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-gray-200 outline-none"
            placeholder="Recipients"
          />
          {!showCc && (
            <button
              className="text-[12px] text-blue-400 hover:text-blue-300 ml-2"
              onClick={() => setShowCc(true)}
            >
              Cc
            </button>
          )}
        </div>
        {showCc && (
          <div className="flex items-center px-3 py-1.5 border-b border-[#2a2a3a]">
            <span className="text-[12px] text-gray-500 w-10 flex-shrink-0">Cc</span>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-gray-200 outline-none"
              placeholder="Cc recipients"
            />
          </div>
        )}
        <div className="flex items-center px-3 py-1.5">
          <span className="text-[12px] text-gray-500 w-10 flex-shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-gray-200 outline-none"
          />
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[#333]">
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><Bold size={14} /></button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><Italic size={14} /></button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><Underline size={14} /></button>
        <div className="w-px h-4 bg-[#444] mx-1" />
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><List size={14} /></button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><ListOrdered size={14} /></button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><AlignLeft size={14} /></button>
        <div className="w-px h-4 bg-[#444] mx-1" />
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><Link size={14} /></button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><Image size={14} /></button>
        <button className="p-1.5 hover:bg-[#333] rounded text-gray-400"><MoreHorizontal size={14} /></button>
      </div>

      {/* Body */}
      <textarea
        className="flex-1 bg-transparent text-[13px] text-gray-200 outline-none resize-none p-3 leading-relaxed"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type your message here..."
        autoFocus
      />

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#333]">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 bg-[#0078d4] text-white px-4 py-1.5 rounded text-[13px] hover:bg-[#106ebe]">
            Send
            <ChevronDown size={12} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
            <Paperclip size={16} />
          </button>
          <button className="p-1.5 hover:bg-[#333] rounded text-gray-400">
            <MoreHorizontal size={16} />
          </button>
          <button className="p-1.5 hover:bg-[#333] rounded text-gray-400" onClick={onClose}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
