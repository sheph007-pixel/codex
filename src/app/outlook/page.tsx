"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PublicClientApplication, type AuthenticationResult } from "@azure/msal-browser";
import { Button } from "@/components/ui/button";
import { Mail, ArrowUpDown, ArrowLeft, Search, Loader2, ChevronDown, ChevronRight, LogIn } from "lucide-react";
import Link from "next/link";

const CLIENT_ID = "ea376f6c-94ff-468a-b252-570f4a970bb4";
const SCOPES = ["Mail.Read", "User.Read"];

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

interface EmailMessage {
  from?: { emailAddress?: { address?: string; name?: string } };
  toRecipients?: { emailAddress?: { address?: string; name?: string } }[];
  sentDateTime?: string;
  receivedDateTime?: string;
  isDraft?: boolean;
}

interface DomainStats {
  domain: string;
  companies: Set<string>;
  total: number;
  sent: number;
  received: number;
  lastCommunication: string;
  contacts: Map<string, { name: string; count: number }>;
}

type SortKey = "total" | "sent" | "received" | "lastCommunication" | "domain";

// --- Email scanning helpers (all client-side) ---

function extractDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() || "unknown";
}

const GENERIC_DOMAINS = new Set([
  "gmail", "yahoo", "hotmail", "outlook", "live", "aol", "icloud",
  "protonmail", "mail", "msn", "comcast", "att", "verizon",
]);

function getOrCreateDomain(map: Map<string, DomainStats>, domain: string): DomainStats {
  let stats = map.get(domain);
  if (!stats) {
    stats = { domain, companies: new Set(), total: 0, sent: 0, received: 0, lastCommunication: "", contacts: new Map() };
    map.set(domain, stats);
  }
  return stats;
}

function guessCompany(stats: DomainStats, domain: string) {
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const name = parts[parts.length - 2];
    if (!GENERIC_DOMAINS.has(name)) {
      stats.companies.add(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }
}

async function fetchFolder(
  token: string,
  folder: string,
  direction: "sent" | "received",
  userDomain: string,
  domainMap: Map<string, DomainStats>,
  onProgress: (count: number) => void,
) {
  let url: string | null =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages?$top=500&$select=from,toRecipients,sentDateTime,receivedDateTime,isDraft&$orderby=receivedDateTime desc`;

  let pageCount = 0;
  let processed = 0;

  while (url && pageCount < 20) {
    const fetchRes: Response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!fetchRes.ok) break;
    const data = await fetchRes.json();
    const messages: EmailMessage[] = data.value || [];

    for (const msg of messages) {
      if (msg.isDraft) continue;

      if (direction === "received") {
        const fromEmail = msg.from?.emailAddress?.address?.toLowerCase();
        if (!fromEmail) continue;
        const domain = extractDomain(fromEmail);
        if (domain === userDomain) continue;
        const stats = getOrCreateDomain(domainMap, domain);
        stats.received++;
        stats.total++;
        const dt = msg.receivedDateTime || msg.sentDateTime || "";
        if (dt > stats.lastCommunication) stats.lastCommunication = dt;
        const ce = stats.contacts.get(fromEmail);
        const name = msg.from?.emailAddress?.name || fromEmail;
        if (ce) { ce.count++; if (name !== fromEmail) ce.name = name; }
        else stats.contacts.set(fromEmail, { name, count: 1 });
        guessCompany(stats, domain);
      } else {
        for (const r of msg.toRecipients || []) {
          const toEmail = r.emailAddress?.address?.toLowerCase();
          if (!toEmail) continue;
          const domain = extractDomain(toEmail);
          if (domain === userDomain) continue;
          const stats = getOrCreateDomain(domainMap, domain);
          stats.sent++;
          stats.total++;
          const dt = msg.sentDateTime || msg.receivedDateTime || "";
          if (dt > stats.lastCommunication) stats.lastCommunication = dt;
          const name = r.emailAddress?.name || toEmail;
          const ce = stats.contacts.get(toEmail);
          if (ce) { ce.count++; if (name !== toEmail) ce.name = name; }
          else stats.contacts.set(toEmail, { name, count: 1 });
          guessCompany(stats, domain);
        }
      }
      processed++;
    }

    onProgress(processed);
    url = data["@odata.nextLink"] || null;
    pageCount++;
  }
}

// --- Component ---

export default function OutlookPage() {
  const msalRef = useRef<PublicClientApplication | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const msal = new PublicClientApplication({
      auth: {
        clientId: CLIENT_ID,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + "/outlook",
      },
      cache: { cacheLocation: "sessionStorage" },
    });
    msal.initialize().then(() => {
      msalRef.current = msal;
      // Check if already signed in
      const accounts = msal.getAllAccounts();
      if (accounts.length > 0) {
        msal.acquireTokenSilent({ scopes: SCOPES, account: accounts[0] })
          .then((result) => {
            setAccessToken(result.accessToken);
            setAuthenticated(true);
            setUserEmail(accounts[0].username);
          })
          .catch(() => { /* silent fail, user will click sign in */ });
      }
    });
  }, []);

  const handleSignIn = useCallback(async () => {
    if (!msalRef.current) return;
    setError(null);
    try {
      const result: AuthenticationResult = await msalRef.current.loginPopup({
        scopes: SCOPES,
        prompt: "select_account",
      });
      setAccessToken(result.accessToken);
      setAuthenticated(true);
      setUserEmail(result.account?.username || "");
    } catch (e) {
      if (e instanceof Error && e.message.includes("user_cancelled")) return;
      setError(e instanceof Error ? e.message : "Sign in failed");
    }
  }, []);

  const startScan = useCallback(async () => {
    if (!accessToken) return;
    setScanning(true);
    setError(null);
    setProgress("Starting scan...");

    try {
      // Get user email domain
      const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!meRes.ok) throw new Error("Failed to fetch user profile. Token may be expired — sign in again.");
      const me = await meRes.json();
      const email = (me.mail || me.userPrincipalName || "").toLowerCase();
      setUserEmail(email);
      const userDomain = extractDomain(email);

      const domainMap = new Map<string, DomainStats>();

      setProgress("Scanning inbox...");
      await fetchFolder(accessToken, "inbox", "received", userDomain, domainMap, (n) =>
        setProgress(`Scanning inbox... ${n.toLocaleString()} emails`),
      );

      setProgress("Scanning sent mail...");
      await fetchFolder(accessToken, "sentitems", "sent", userDomain, domainMap, (n) =>
        setProgress(`Scanning sent mail... ${n.toLocaleString()} emails`),
      );

      // Convert to array
      const results: DomainData[] = Array.from(domainMap.values())
        .map((d) => ({
          domain: d.domain,
          companies: Array.from(d.companies),
          total: d.total,
          sent: d.sent,
          received: d.received,
          lastCommunication: d.lastCommunication,
          topContacts: Array.from(d.contacts.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([em, info]) => ({ email: em, name: info.name, count: info.count })),
        }))
        .sort((a, b) => b.total - a.total);

      setDomains(results);
      setScanned(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
      setProgress("");
    }
  }, [accessToken]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
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
      if (sortKey === "domain") cmp = a.domain.localeCompare(b.domain);
      else if (sortKey === "lastCommunication") cmp = a.lastCommunication.localeCompare(b.lastCommunication);
      else cmp = a[sortKey] - b[sortKey];
      return sortAsc ? cmp : -cmp;
    });

  const totalEmails = domains.reduce((s, d) => s + d.total, 0);
  const totalSent = domains.reduce((s, d) => s + d.sent, 0);
  const totalReceived = domains.reduce((s, d) => s + d.received, 0);

  function formatDate(iso: string) {
    if (!iso) return "\u2014";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function timeAgo(iso: string) {
    if (!iso) return "";
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button onClick={() => handleSort(sortKeyName)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-50" />
      {sortKey === sortKeyName && <span className="text-xs">{sortAsc ? "\u2191" : "\u2193"}</span>}
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
                <ArrowLeft className="h-4 w-4 mr-1" /> CRM
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Mail className="h-6 w-6" /> Outlook Email Analyzer
              </h1>
              {userEmail && <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>}
            </div>
          </div>
        </div>

        {/* Sign In */}
        {!authenticated && !scanned && (
          <div className="border border-border rounded-lg p-12 text-center max-w-lg mx-auto">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Scan Your Outlook Emails</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Sign in with your Microsoft account to analyze your inbox. We&apos;ll show you
              who you email the most, organized by company and domain.
            </p>
            <Button size="lg" onClick={handleSignIn}>
              <LogIn className="h-4 w-4 mr-2" /> Sign in with Microsoft
            </Button>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>
        )}

        {/* Authenticated - Ready to Scan */}
        {authenticated && !scanned && (
          <div className="border border-border rounded-lg p-12 text-center max-w-lg mx-auto">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Ready to Scan</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Signed in as <strong className="text-foreground">{userEmail}</strong>. Click below to scan your inbox and sent mail.
            </p>
            <Button size="lg" onClick={startScan} disabled={scanning} className="w-full max-w-xs">
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {progress || "Scanning..."}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" /> Start Scan
                </>
              )}
            </Button>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>
        )}

        {/* Results */}
        {scanned && (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Domains", value: domains.length },
                { label: "Total Emails", value: totalEmails },
                { label: "Sent", value: totalSent },
                { label: "Received", value: totalReceived },
              ].map((s) => (
                <div key={s.label} className="border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter by domain, company, or contact..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
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
                      <div className="flex justify-end"><SortHeader label="Total" sortKeyName="total" /></div>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end"><SortHeader label="Sent" sortKeyName="sent" /></div>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end"><SortHeader label="Received" sortKeyName="received" /></div>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <div className="flex justify-end"><SortHeader label="Last Contact" sortKeyName="lastCommunication" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.flatMap((d) => {
                    const rows = [
                      <tr
                        key={d.domain}
                        className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setExpandedDomain(expandedDomain === d.domain ? null : d.domain)}
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {expandedDomain === d.domain ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{d.domain}</div>
                          {d.companies.length > 0 && <div className="text-xs text-muted-foreground">{d.companies.join(", ")}</div>}
                        </td>
                        <td className="text-right px-4 py-3 font-mono font-medium">{d.total.toLocaleString()}</td>
                        <td className="text-right px-4 py-3 font-mono text-blue-400">{d.sent.toLocaleString()}</td>
                        <td className="text-right px-4 py-3 font-mono text-green-400">{d.received.toLocaleString()}</td>
                        <td className="text-right px-4 py-3">
                          <div className="text-foreground">{formatDate(d.lastCommunication)}</div>
                          <div className="text-xs text-muted-foreground">{timeAgo(d.lastCommunication)}</div>
                        </td>
                      </tr>,
                    ];
                    if (expandedDomain === d.domain && d.topContacts.length > 0) {
                      rows.push(
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
                        </tr>,
                      );
                    }
                    return rows;
                  })}
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
