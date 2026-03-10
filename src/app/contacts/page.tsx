"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Contact, Company, Activity, Json } from "@/lib/database.types";
import { ContactsTable } from "@/components/contacts-table";
import { DetailSidebar } from "@/components/detail-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, RefreshCw } from "lucide-react";

// Extended contact with joined company data
export interface ContactWithCompany extends Contact {
  company?: Company;
}

export default function ContactsPage() {
  const { crmUserId } = useAuth();
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] =
    useState<ContactWithCompany | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!crmUserId) { setLoading(false); return; }
    setLoading(true);
    const [contactsRes, companiesRes] = await Promise.all([
      supabase.from("contacts").select("*").eq("user_id", crmUserId).order("last_activity_date", { ascending: false }),
      supabase.from("companies").select("*").eq("user_id", crmUserId).order("last_activity_date", { ascending: false }),
    ]);

    const companyData = (companiesRes.data ?? []) as Company[];
    const contactData = (contactsRes.data ?? []) as Contact[];

    const companiesMap = new Map(
      companyData.map((c) => [c.id, c])
    );

    const enrichedContacts: ContactWithCompany[] = contactData.map(
      (contact) => ({
        ...contact,
        company: companiesMap.get(contact.company_id) ?? undefined,
      })
    );

    setContacts(enrichedContacts);
    setCompanies(companyData);
    setLoading(false);
  }, [crmUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch activities when a contact is selected
  useEffect(() => {
    if (!selectedContact) {
      setActivities([]);
      return;
    }
    let ignore = false;
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", crmUserId!)
        .or(
          `contact_id.eq.${selectedContact.id},company_id.eq.${selectedContact.company_id}`
        )
        .order("occurred_at", { ascending: false })
        .limit(50);
      if (!ignore) setActivities((data ?? []) as Activity[]);
    };
    fetchActivities();
    return () => { ignore = true; };
  }, [selectedContact, crmUserId]);

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.company_name?.toLowerCase().includes(q) ||
        c.company?.domain.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const handleSelectContact = (contact: ContactWithCompany) => {
    setSelectedContact(contact);
    setSidebarOpen(true);
    setAiSummary(null);
  };

  const handleGenerateSummary = async () => {
    if (!selectedContact) return;
    setAiLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          contact: selectedContact,
          activities,
        }),
      });
      const data = await res.json();
      setAiSummary(data.summary ?? data.error ?? "No summary generated.");
    } catch {
      setAiSummary("Failed to generate summary.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdateAttributes = async (
    contactId: string,
    attributes: Record<string, unknown>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("contacts") as any).update({ attributes }).eq("id", contactId);
    const attrsJson = attributes as Json;
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, attributes: attrsJson } : c
      )
    );
    if (selectedContact?.id === contactId) {
      setSelectedContact((prev) =>
        prev ? { ...prev, attributes: attrsJson } : prev
      );
    }
  };

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 px-6 h-14 border-b shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts, companies, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {filteredContacts.length} contacts
          </span>
        </div>
      </div>

      {/* Data table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading contacts...
          </div>
        ) : (
          <ContactsTable
            data={filteredContacts}
            onSelectContact={handleSelectContact}
          />
        )}
      </div>

      {/* Detail sidebar */}
      <DetailSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        contact={selectedContact}
        activities={activities}
        aiSummary={aiSummary}
        aiLoading={aiLoading}
        onGenerateSummary={handleGenerateSummary}
        onUpdateAttributes={handleUpdateAttributes}
      />
    </>
  );
}
