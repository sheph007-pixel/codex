"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowUpDown, ArrowLeft, Search, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Contact {
  email: string;
  name: string;
  count: number;
}

interface DomainData {
  domain: string;
  companies: string[];
  total: number;
  sent: number;
  received: number;
  lastCommunication: string;
  topContacts: Contact[];
}

type SortKey = "total" | "sent" | "received" | "lastCommunication" | "domain";

export default function OutlookPage() {
  const [token, setToken] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  // Grab token from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const err = params.get("error");
    if (t) {
      setToken(t);
      // Clean URL
      window.history.replaceState({}, "", "/outlook");
    }
    if (err) {
      setError(decodeURIComponent(err));
      window.history.replaceState({}, "", "/outlook");
    }
  }, []);

  const startScan = useCallback(async () => {
    if (!token) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/outlook/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setDomains(data.domains);
      setUserEmail(data.userEmail);
      setScanned(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }, [token]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...domains]
    .filter((d) => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        d.domain.includes(q) ||
        d.companies.some((c) => c.toLowerCase().includes(q)) ||
        d.topContacts.some((c) => c.email.includes(q) || c.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "domain") {
        cmp = a.domain.localeCompare(b.domain);
      } else if (sortKey === "lastCommunication") {
        cmp = a.lastCommunication.localeCompare(b.lastCommunication);
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortAsc ? cmp : -cmp;
    });

  const totalEmails = domains.reduce((s, d) => s + d.total, 0);
  const totalSent = domains.reduce((s, d) => s + d.sent, 0);
  const totalReceived = domains.reduce((s, d) => s + d.received, 0);

  function formatDate(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function timeAgo(iso: string) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-50" />
      {sortKey === sortKeyName && <span className="text-xs">{sortAsc ? "↑" : "↓"}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                CRM
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Outlook Email Analyzer
              </h1>
              {userEmail && (
                <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Auth / Scan Controls */}
        {!token && !scanned && (
          <div className="border border-border rounded-lg p-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Outlook Account</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Sign in with Microsoft to scan your emails. We&apos;ll analyze your inbox and sent
              mail to show you who you communicate with most.
            </p>
            <a href="/api/outlook/auth">
              <Button size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Sign in with Microsoft
              </Button>
            </a>
            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}
          </div>
        )}

        {token && !scanned && (
          <div className="border border-border rounded-lg p-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Ready to Scan</h2>
            <p className="text-muted-foreground mb-6">
              Connected to Microsoft. Click below to scan your emails.
            </p>
            <Button size="lg" onClick={startScan} disabled={scanning}>
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning emails...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}
          </div>
        )}

        {/* Results */}
        {scanned && (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Domains</p>
                <p className="text-2xl font-bold">{domains.length}</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-2xl font-bold">{totalEmails.toLocaleString()}</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold">{totalReceived.toLocaleString()}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by domain, company, or contact..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8"></th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      <SortHeader label="Domain / Company" sortKeyName="domain" />
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end">
                        <SortHeader label="Total" sortKeyName="total" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end">
                        <SortHeader label="Sent" sortKeyName="sent" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end">
                        <SortHeader label="Received" sortKeyName="received" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end">
                        <SortHeader label="Last Contact" sortKeyName="lastCommunication" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((d) => (
                    <>
                      <tr
                        key={d.domain}
                        className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setExpandedDomain(expandedDomain === d.domain ? null : d.domain)}
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {expandedDomain === d.domain ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{d.domain}</div>
                          {d.companies.length > 0 && (
                            <div className="text-xs text-muted-foreground">{d.companies.join(", ")}</div>
                          )}
                        </td>
                        <td className="text-right px-4 py-3 font-mono font-medium">{d.total.toLocaleString()}</td>
                        <td className="text-right px-4 py-3 font-mono text-blue-400">{d.sent.toLocaleString()}</td>
                        <td className="text-right px-4 py-3 font-mono text-green-400">{d.received.toLocaleString()}</td>
                        <td className="text-right px-4 py-3">
                          <div className="text-foreground">{formatDate(d.lastCommunication)}</div>
                          <div className="text-xs text-muted-foreground">{timeAgo(d.lastCommunication)}</div>
                        </td>
                      </tr>
                      {expandedDomain === d.domain && d.topContacts.length > 0 && (
                        <tr key={`${d.domain}-contacts`} className="bg-muted/20">
                          <td colSpan={6} className="px-8 py-3">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Top Contacts</p>
                            <div className="space-y-1">
                              {d.topContacts.map((c) => (
                                <div key={c.email} className="flex items-center justify-between text-sm">
                                  <div>
                                    <span className="text-foreground">{c.name}</span>
                                    <span className="text-muted-foreground ml-2">{c.email}</span>
                                  </div>
                                  <span className="font-mono text-muted-foreground">{c.count} emails</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        {filter ? "No domains match your filter." : "No email data found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Scanned up to 10,000 emails from inbox and sent folders.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
