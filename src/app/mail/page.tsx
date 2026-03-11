"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AppSidebar } from "@/components/mail/app-sidebar";
import { TopHeader } from "@/components/mail/top-header";
import { Toolbar } from "@/components/mail/toolbar";
import { FolderSidebar } from "@/components/mail/folder-sidebar";
import { EmailList } from "@/components/mail/email-list";
import { EmailPreview } from "@/components/mail/email-preview";
import { CrmSidebar } from "@/components/mail/crm-sidebar";
import { ComposeModal } from "@/components/mail/compose-modal";
import { QueryProvider } from "@/lib/query-provider";
import { useMailStore } from "@/stores/mail-store";

function MailApp() {
  const { sidebarOpen } = useMailStore();
  const [activeApp, setActiveApp] = useState("mail");

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e2e] text-[#cccccc] overflow-hidden">
      {/* Top header with search */}
      <TopHeader />

      {/* Toolbar (compact, Gmail-style) */}
      <Toolbar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* App sidebar (narrow icon strip) */}
        <AppSidebar activeApp={activeApp} onSelectApp={setActiveApp} />

        {/* Resizable 3-pane layout */}
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          {/* Folder sidebar */}
          {sidebarOpen && (
            <>
              <ResizablePanel
                id="folder-sidebar"
                defaultSize="16%"
                minSize="12%"
                maxSize="24%"
                className="min-w-0"
              >
                <FolderSidebar />
              </ResizablePanel>
              <ResizableHandle className="bg-[#2a2a3a] hover:bg-[#0078d4] transition-colors w-[1px]" />
            </>
          )}

          {/* Email list */}
          <ResizablePanel
            id="email-list"
            defaultSize="24%"
            minSize="18%"
            maxSize="36%"
            className="min-w-0"
          >
            <EmailList />
          </ResizablePanel>
          <ResizableHandle className="bg-[#2a2a3a] hover:bg-[#0078d4] transition-colors w-[1px]" />

          {/* Reading pane */}
          <ResizablePanel id="reading-pane" defaultSize="60%" minSize="30%" className="min-w-0">
            <EmailPreview />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* CRM Contact Sidebar */}
        <CrmSidebar />
      </div>

      {/* Compose modal */}
      <ComposeModal />
    </div>
  );
}

export default function MailPage() {
  return (
    <QueryProvider>
      <MailApp />
    </QueryProvider>
  );
}
