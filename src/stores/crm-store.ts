import { create } from "zustand";

export interface CrmContactData {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  type: string;
  status: string;
  tags: string[];
  notes: string | null;
  lastContactedAt: string | null;
  sentCount: number;
  receivedCount: number;
  deals: DealData[];
  recentActivity: ActivityData[];
}

export interface DealData {
  id: string;
  title: string;
  value: number | null;
  currency: string;
  stage: string;
  probability: number | null;
  expectedClose: string | null;
}

export interface ActivityData {
  id: string;
  type: string;
  title: string;
  description: string | null;
  occurredAt: string;
}

interface CrmState {
  // The contact currently shown in the CRM sidebar (matched by email)
  activeContact: CrmContactData | null;
  isLoading: boolean;

  // Actions
  setActiveContact: (contact: CrmContactData | null) => void;
  setLoading: (loading: boolean) => void;
  clearContact: () => void;
}

export const useCrmStore = create<CrmState>((set) => ({
  activeContact: null,
  isLoading: false,

  setActiveContact: (contact) => set({ activeContact: contact, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearContact: () => set({ activeContact: null, isLoading: false }),
}));
