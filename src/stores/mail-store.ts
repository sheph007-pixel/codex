import { create } from "zustand";

interface MailState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;
  crmSidebarOpen: boolean;

  // Selection
  selectedAccountId: string;
  selectedFolderId: string;
  selectedEmailId: string | null;

  // UI
  searchQuery: string;
  activeTab: "home" | "view" | "help";
  composeOpen: boolean;
  composeMode: "new" | "reply" | "replyAll" | "forward";

  // Collapsed state for folder tree
  collapsedSections: Record<string, boolean>;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (w: number) => void;
  setCrmSidebarOpen: (open: boolean) => void;
  setSelectedAccount: (id: string) => void;
  setSelectedFolder: (id: string) => void;
  setSelectedEmail: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: "home" | "view" | "help") => void;
  openCompose: (mode?: "new" | "reply" | "replyAll" | "forward") => void;
  closeCompose: () => void;
  toggleSection: (id: string) => void;
}

export const useMailStore = create<MailState>((set) => ({
  sidebarOpen: true,
  sidebarWidth: 260,
  crmSidebarOpen: true,

  selectedAccountId: "hunter",
  selectedFolderId: "hunter-inbox",
  selectedEmailId: "email-1",

  searchQuery: "",
  activeTab: "home",
  composeOpen: false,
  composeMode: "new",

  collapsedSections: {},

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (w) => set({ sidebarWidth: w }),
  setCrmSidebarOpen: (open) => set({ crmSidebarOpen: open }),
  setSelectedAccount: (id) => set({ selectedAccountId: id }),
  setSelectedFolder: (id) => set({ selectedFolderId: id, selectedEmailId: null }),
  setSelectedEmail: (id) => set({ selectedEmailId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  openCompose: (mode = "new") => set({ composeOpen: true, composeMode: mode }),
  closeCompose: () => set({ composeOpen: false }),
  toggleSection: (id) =>
    set((s) => ({
      collapsedSections: {
        ...s.collapsedSections,
        [id]: !s.collapsedSections[id],
      },
    })),
}));
