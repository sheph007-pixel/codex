import { useQuery } from "@tanstack/react-query";
import type { CrmContactData } from "@/stores/crm-store";

// Demo CRM contact data - in production, this fetches from Prisma/Supabase
const demoCrmContacts: CrmContactData[] = [
  {
    id: "crm-1",
    email: "adobesign@adobesign.com",
    name: "Strategic Risk Solutions",
    company: "Strategic Risk Solutions Enterprise",
    jobTitle: null,
    phone: null,
    type: "vendor",
    status: "active",
    tags: ["insurance", "documents", "signing"],
    notes: "Adobe Acrobat Sign integration for document signing workflows.",
    lastContactedAt: "2026-03-11T08:06:00Z",
    sentCount: 0,
    receivedCount: 12,
    deals: [],
    recentActivity: [
      { id: "a-1", type: "email_received", title: "Received signed document notification", description: "One Trust MPMT Travelers Wrap+ Designated Benefit Plan", occurredAt: "2026-03-11T08:06:00Z" },
    ],
  },
  {
    id: "crm-2",
    email: "robert.strauss@insurance.com",
    name: "Robert Strauss",
    company: "Strauss Insurance Group",
    jobTitle: "Senior Producer",
    phone: "(205) 555-0142",
    type: "contact",
    status: "active",
    tags: ["life-insurance", "producer"],
    notes: "Key contact for life insurance product distribution.",
    lastContactedAt: "2026-03-11T07:22:00Z",
    sentCount: 8,
    receivedCount: 15,
    deals: [
      { id: "d-1", title: "Life Insurance Distribution Partnership", value: 125000, currency: "USD", stage: "negotiation", probability: 65, expectedClose: "2026-04-30" },
    ],
    recentActivity: [
      { id: "a-2", type: "email_received", title: "Standard issue for every life insurance producer", description: null, occurredAt: "2026-03-11T07:22:00Z" },
      { id: "a-3", type: "email_sent", title: "Re: Producer requirements", description: null, occurredAt: "2026-03-09T14:30:00Z" },
    ],
  },
  {
    id: "crm-3",
    email: "megan.kumm@strategicrisks.com",
    name: "Megan Kumm",
    company: "Strategic Risk Solutions",
    jobTitle: "Financial Analyst",
    phone: "(205) 555-0198",
    type: "contact",
    status: "active",
    tags: ["finance", "reports", "cash-balance"],
    notes: "Primary contact for financial reporting and cash balance reports.",
    lastContactedAt: "2026-03-11T07:10:00Z",
    sentCount: 22,
    receivedCount: 34,
    deals: [
      { id: "d-2", title: "Q1 2026 Reporting Contract", value: 45000, currency: "USD", stage: "closed_won", probability: 100, expectedClose: null },
      { id: "d-3", title: "Annual Advisory Retainer", value: 85000, currency: "USD", stage: "proposal", probability: 45, expectedClose: "2026-06-01" },
    ],
    recentActivity: [
      { id: "a-4", type: "email_received", title: "Kennion Combined Cash Balance Report - February 2026", description: null, occurredAt: "2026-03-11T07:10:00Z" },
      { id: "a-5", type: "email_received", title: "AEA MPMT February 2026 Cash Balance Report", description: null, occurredAt: "2026-03-11T07:10:00Z" },
    ],
  },
  {
    id: "crm-4",
    email: "miller.bradford@benefits.com",
    name: "Miller Bradford",
    company: "Bradford Benefits Consulting",
    jobTitle: "Benefits Consultant",
    phone: "(205) 555-0176",
    type: "lead",
    status: "active",
    tags: ["benefits", "non-profit"],
    notes: "Inquired about benefits packages for small non-profits. Hot lead.",
    lastContactedAt: "2026-03-10T17:48:00Z",
    sentCount: 3,
    receivedCount: 5,
    deals: [
      { id: "d-4", title: "Non-Profit Benefits Package", value: 32000, currency: "USD", stage: "qualified", probability: 35, expectedClose: "2026-05-15" },
    ],
    recentActivity: [
      { id: "a-6", type: "email_received", title: "Re: Benefits for a small non-profit", description: null, occurredAt: "2026-03-10T17:48:00Z" },
    ],
  },
  {
    id: "crm-5",
    email: "bobby.reagan@kennion.com",
    name: "Bobby Reagan",
    company: "Kennion & Company",
    jobTitle: "Account Executive",
    phone: "(205) 555-0155",
    type: "contact",
    status: "active",
    tags: ["internal", "programs"],
    notes: "Internal team member handling program info and client calls.",
    lastContactedAt: "2026-03-10T15:28:00Z",
    sentCount: 45,
    receivedCount: 52,
    deals: [],
    recentActivity: [
      { id: "a-7", type: "email_received", title: "RE: Kennion Program Info For Call", description: null, occurredAt: "2026-03-10T15:28:00Z" },
    ],
  },
  {
    id: "crm-6",
    email: "kimberly.swink@partners.com",
    name: "Kimberly Swink",
    company: "Swink & Partners",
    jobTitle: "Managing Partner",
    phone: "(205) 555-0133",
    type: "lead",
    status: "active",
    tags: ["inquiry", "partnership"],
    notes: "Initial inquiry about partnership opportunities.",
    lastContactedAt: "2026-03-10T11:04:00Z",
    sentCount: 2,
    receivedCount: 3,
    deals: [
      { id: "d-5", title: "Partnership Discussion", value: null, currency: "USD", stage: "lead", probability: 15, expectedClose: null },
    ],
    recentActivity: [
      { id: "a-8", type: "email_received", title: "Re: Inquiry", description: null, occurredAt: "2026-03-10T11:04:00Z" },
    ],
  },
  {
    id: "crm-7",
    email: "whitney.bosley@services.com",
    name: "Whitney Bosley",
    company: "Bosley Travel Services",
    jobTitle: "Travel Coordinator",
    phone: null,
    type: "vendor",
    status: "active",
    tags: ["travel", "personal"],
    notes: "Handles travel arrangements for the Shepherd family.",
    lastContactedAt: "2026-03-09T09:40:00Z",
    sentCount: 5,
    receivedCount: 8,
    deals: [],
    recentActivity: [
      { id: "a-9", type: "email_received", title: "Re: Information for Shepherd Family March 22-28", description: null, occurredAt: "2026-03-09T09:40:00Z" },
    ],
  },
  {
    id: "crm-8",
    email: "support@kennion.com",
    name: "Kennion Support",
    company: "Kennion & Company",
    jobTitle: null,
    phone: "(205) 555-0100",
    type: "contact",
    status: "active",
    tags: ["internal", "support"],
    notes: "Internal support email for client management.",
    lastContactedAt: "2026-03-04T09:00:00Z",
    sentCount: 18,
    receivedCount: 25,
    deals: [],
    recentActivity: [
      { id: "a-10", type: "email_received", title: "Fwd: New Group: Going Coastal LLC", description: null, occurredAt: "2026-03-04T09:00:00Z" },
    ],
  },
];

export function useCrmContactByEmail(email: string | null) {
  return useQuery({
    queryKey: ["crm-contact", email],
    queryFn: async () => {
      if (!email) return null;
      // Simulate API call - in production: fetch from Prisma
      await new Promise((r) => setTimeout(r, 100));
      return demoCrmContacts.find((c) => c.email === email) ?? null;
    },
    enabled: !!email,
  });
}
