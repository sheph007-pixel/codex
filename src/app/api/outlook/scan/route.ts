import { NextRequest, NextResponse } from "next/server";

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

function extractDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() || "unknown";
}

function guessSenderName(msg: EmailMessage): string {
  return msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || "Unknown";
}

export async function POST(request: NextRequest) {
  const { accessToken } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 400 });
  }

  const domainMap = new Map<string, DomainStats>();
  const userEmail = await getUserEmail(accessToken);

  // Fetch received emails (inbox + all folders)
  await fetchMessages(accessToken, domainMap, userEmail, "received");
  // Fetch sent emails
  await fetchMessages(accessToken, domainMap, userEmail, "sent");

  // Convert to serializable array
  const results = Array.from(domainMap.values()).map((d) => ({
    domain: d.domain,
    companies: Array.from(d.companies),
    total: d.total,
    sent: d.sent,
    received: d.received,
    lastCommunication: d.lastCommunication,
    topContacts: Array.from(d.contacts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([email, info]) => ({ email, name: info.name, count: info.count })),
  }));

  // Sort by total emails descending
  results.sort((a, b) => b.total - a.total);

  return NextResponse.json({ domains: results, userEmail });
}

async function getUserEmail(token: string): Promise<string> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return "unknown";
  const data = await res.json();
  return (data.mail || data.userPrincipalName || "unknown").toLowerCase();
}

async function fetchMessages(
  token: string,
  domainMap: Map<string, DomainStats>,
  userEmail: string,
  direction: "sent" | "received"
) {
  // For sent: query sentitems folder. For received: query inbox + all messages.
  const folder = direction === "sent" ? "sentitems" : "inbox";
  let url: string | null =
    `https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages?$top=500&$select=from,toRecipients,sentDateTime,receivedDateTime,isDraft&$orderby=receivedDateTime desc`;

  let pageCount = 0;
  const maxPages = 20; // Up to 10,000 emails

  while (url && pageCount < maxPages) {
    const fetchRes: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!fetchRes.ok) break;

    const data = await fetchRes.json();
    const messages: EmailMessage[] = data.value || [];

    for (const msg of messages) {
      if (msg.isDraft) continue;

      if (direction === "received") {
        // The other party is the sender
        const fromEmail = msg.from?.emailAddress?.address?.toLowerCase();
        if (!fromEmail) continue;
        const domain = extractDomain(fromEmail);
        if (domain === extractDomain(userEmail)) continue; // Skip self

        const stats = getOrCreateDomain(domainMap, domain);
        stats.received++;
        stats.total++;
        updateLastCommunication(stats, msg.receivedDateTime || msg.sentDateTime || "");
        updateContact(stats, fromEmail, guessSenderName(msg));
        guessCompany(stats, domain);
      } else {
        // The other parties are the recipients
        for (const recipient of msg.toRecipients || []) {
          const toEmail = recipient.emailAddress?.address?.toLowerCase();
          if (!toEmail) continue;
          const domain = extractDomain(toEmail);
          if (domain === extractDomain(userEmail)) continue;

          const stats = getOrCreateDomain(domainMap, domain);
          stats.sent++;
          stats.total++;
          updateLastCommunication(stats, msg.sentDateTime || msg.receivedDateTime || "");
          updateContact(stats, toEmail, recipient.emailAddress?.name || toEmail);
          guessCompany(stats, domain);
        }
      }
    }

    url = data["@odata.nextLink"] || null;
    pageCount++;
  }
}

function getOrCreateDomain(map: Map<string, DomainStats>, domain: string): DomainStats {
  let stats = map.get(domain);
  if (!stats) {
    stats = {
      domain,
      companies: new Set<string>(),
      total: 0,
      sent: 0,
      received: 0,
      lastCommunication: "",
      contacts: new Map(),
    };
    map.set(domain, stats);
  }
  return stats;
}

function updateLastCommunication(stats: DomainStats, dateStr: string) {
  if (dateStr > stats.lastCommunication) {
    stats.lastCommunication = dateStr;
  }
}

function updateContact(stats: DomainStats, email: string, name: string) {
  const existing = stats.contacts.get(email);
  if (existing) {
    existing.count++;
    if (name && name !== email) existing.name = name;
  } else {
    stats.contacts.set(email, { name, count: 1 });
  }
}

function guessCompany(stats: DomainStats, domain: string) {
  // Simple company name guess from domain
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const name = parts[parts.length - 2];
    // Skip generic email providers
    const generic = new Set([
      "gmail", "yahoo", "hotmail", "outlook", "live", "aol", "icloud",
      "protonmail", "mail", "msn", "comcast", "att", "verizon",
    ]);
    if (!generic.has(name)) {
      stats.companies.add(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }
}
