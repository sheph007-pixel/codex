"use client";

import { useState, useMemo, useCallback } from "react";
import { AppSidebar } from "@/components/mail/app-sidebar";
import { TopHeader } from "@/components/mail/top-header";
import { TabBar } from "@/components/mail/tab-bar";
import { Toolbar } from "@/components/mail/toolbar";
import { FolderSidebar } from "@/components/mail/folder-sidebar";
import { EmailList } from "@/components/mail/email-list";
import { EmailPreview } from "@/components/mail/email-preview";
import { ComposeModal } from "@/components/mail/compose-modal";
import { emailAccounts, emails as allEmails } from "@/lib/mail-data";
import type { Email } from "@/lib/mail-types";

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

export default function MailPage() {
  const [activeApp, setActiveApp] = useState("mail");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedFolderId, setSelectedFolderId] = useState("hunter-inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>("email-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"new" | "reply" | "replyAll" | "forward">("new");
  const [folderSidebarWidth] = useState(260);
  const [emailListWidth] = useState(380);

  const filteredEmails = useMemo(() => {
    let result = allEmails.filter((e) => e.folderId === selectedFolderId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.from.name.toLowerCase().includes(q) ||
          e.from.email.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedFolderId, searchQuery]);

  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    return allEmails.find((e) => e.id === selectedEmailId) ?? null;
  }, [selectedEmailId]);

  const folderName = useMemo(() => findFolderName(selectedFolderId), [selectedFolderId]);

  const handleSelectFolder = useCallback((folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedEmailId(null);
  }, []);

  const handleSelectEmail = useCallback((emailId: string) => {
    setSelectedEmailId(emailId);
  }, []);

  const handleCompose = useCallback(() => {
    setComposeMode("new");
    setComposeOpen(true);
  }, []);

  const handleReply = useCallback(() => {
    if (selectedEmail) {
      setComposeMode("reply");
      setComposeOpen(true);
    }
  }, [selectedEmail]);

  const handleReplyAll = useCallback(() => {
    if (selectedEmail) {
      setComposeMode("replyAll");
      setComposeOpen(true);
    }
  }, [selectedEmail]);

  const handleForward = useCallback(() => {
    if (selectedEmail) {
      setComposeMode("forward");
      setComposeOpen(true);
    }
  }, [selectedEmail]);

  const handleDelete = useCallback(() => {
    // Move email to deleted - for now just remove from selection
    setSelectedEmailId(null);
  }, []);

  const handleArchive = useCallback(() => {
    setSelectedEmailId(null);
  }, []);

  const getReplyTo = () => {
    if (!selectedEmail) return undefined;
    return {
      from: selectedEmail.from,
      to: selectedEmail.to,
      cc: selectedEmail.cc,
      subject: selectedEmail.subject,
      body: selectedEmail.body,
      date: selectedEmail.date,
    };
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e2e] text-[#cccccc] overflow-hidden">
      {/* Top header with search */}
      <TopHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* Tab bar */}
      <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Toolbar */}
      <Toolbar
        onCompose={handleCompose}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onDelete={handleDelete}
        onArchive={handleArchive}
        hasSelectedEmail={!!selectedEmail}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* App sidebar (narrow icon strip) */}
        <AppSidebar activeApp={activeApp} onSelectApp={setActiveApp} />

        {/* Folder sidebar */}
        {showSidebar && (
          <div style={{ width: folderSidebarWidth }} className="flex-shrink-0">
            <FolderSidebar
              accounts={emailAccounts}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleSelectFolder}
            />
          </div>
        )}

        {/* Email list */}
        <div style={{ width: emailListWidth }} className="flex-shrink-0">
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            folderName={folderName}
          />
        </div>

        {/* Email preview */}
        <EmailPreview email={selectedEmail} />
      </div>

      {/* Compose modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        replyTo={getReplyTo()}
        mode={composeMode}
      />
    </div>
  );
}
