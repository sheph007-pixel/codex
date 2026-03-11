import type { EmailAccount, Email } from "./mail-types";

export const emailAccounts: EmailAccount[] = [
  {
    id: "hunter",
    email: "hunter@kennion.com",
    displayName: "hunter@kennion.com",
    folders: [
      {
        id: "hunter-inbox",
        name: "Inbox",
        type: "inbox",
        unreadCount: 1,
        children: [
          { id: "hunter-taxes-2026", name: "TAXES 2026", type: "custom", children: [
            { id: "hunter-ops-friday", name: "Operations Friday", type: "custom", color: "#4a86c8" },
          ]},
          { id: "hunter-separator-1", name: "--------", type: "custom" },
        ],
      },
      { id: "hunter-waiting", name: "Waiting On", type: "custom", flagIcon: "star", color: "#e8564a" },
      {
        id: "hunter-kennion",
        name: "KENNION",
        type: "custom",
        children: [
          { id: "hunter-problems", name: "1. Problems", type: "custom" },
          { id: "hunter-apta", name: "2. Apta Medecash", type: "custom" },
          { id: "hunter-balance", name: "3. Balance Bills", type: "custom" },
          { id: "hunter-idr", name: "4. IDR", type: "custom" },
          { id: "hunter-1095", name: "1095", type: "custom" },
          { id: "hunter-hal", name: "HAL", type: "custom" },
          { id: "hunter-ourcompanies", name: "Our Companies", type: "custom" },
        ],
      },
      {
        id: "hunter-personal",
        name: "PERSONAL",
        type: "custom",
      },
      { id: "hunter-drafts", name: "Drafts", type: "drafts" },
      { id: "hunter-sent", name: "Sent Items", type: "sent" },
      { id: "hunter-snoozed", name: "Snoozed", type: "custom" },
      { id: "hunter-deleted", name: "Deleted Items", type: "deleted", unreadCount: 4 },
      { id: "hunter-junk", name: "Junk Email", type: "junk", unreadCount: 2 },
      { id: "hunter-notes", name: "Notes", type: "notes" },
      { id: "hunter-archive", name: "Archive", type: "archive" },
      { id: "hunter-conversation", name: "Conversation History", type: "custom" },
      { id: "hunter-outbox", name: "Outbox", type: "outbox" },
      { id: "hunter-rss", name: "RSS Subscriptions", type: "custom" },
      { id: "hunter-search", name: "Search Folders", type: "custom" },
      { id: "hunter-groups", name: "Go to Groups", type: "custom" },
    ],
  },
  {
    id: "sheph007",
    email: "sheph007@gmail.com",
    displayName: "sheph007@gmail.com",
    folders: [
      { id: "sheph-inbox", name: "Inbox", type: "inbox" },
      { id: "sheph-sent", name: "Sent Items", type: "sent" },
      { id: "sheph-drafts", name: "Drafts", type: "drafts" },
      { id: "sheph-deleted", name: "Deleted Items", type: "deleted" },
      { id: "sheph-junk", name: "Junk Email", type: "junk" },
      { id: "sheph-archive", name: "Archive", type: "archive" },
    ],
  },
];

export const favoritesFolders = [
  { id: "fav-waiting", name: "Waiting On", flagIcon: "star", color: "#e8564a", linkedFolderId: "hunter-waiting" },
  { id: "fav-ops", name: "Operations Friday", color: "#4a86c8", linkedFolderId: "hunter-ops-friday" },
  { id: "fav-taxes", name: "TAXES 2026", linkedFolderId: "hunter-taxes-2026" },
  { id: "fav-sep", name: "--------", linkedFolderId: "hunter-separator-1" },
  { id: "fav-sent", name: "Sent Items", linkedFolderId: "hunter-sent" },
];

// Helper to create dates relative to "now" (Wed 3/11/2026)
const now = new Date(2026, 2, 11, 8, 6, 0); // March 11, 2026 8:06 AM
const today = (h: number, m: number) => new Date(2026, 2, 11, h, m, 0);
const yesterday = (h: number, m: number) => new Date(2026, 2, 10, h, m, 0);
const monday = (h: number, m: number) => new Date(2026, 2, 9, h, m, 0);
const lastWed = (h: number, m: number) => new Date(2026, 2, 4, h, m, 0);
const lastTue = (h: number, m: number) => new Date(2026, 2, 3, h, m, 0);
void now;

export const emails: Email[] = [
  // Today
  {
    id: "email-1",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Strategic Risk Solutions Enterprise via Adobe Acrobat Sign", email: "adobesign@adobesign.com" },
    to: [
      { name: "Bridget van Wyk", email: "Bridget.vanWyk@strategicrisks.com" },
      { name: "Hunter Shepherd", email: "hunter@kennion.com" },
    ],
    cc: [
      { name: "Megan Kumm", email: "megan.kumm@strategicrisks.com" },
    ],
    subject: 'You signed: "One Trust MPMT Travelers Wrap+ Designated Benefit Plan Fidu...',
    preview: "You signed: \"One Trust MPMT Travelers Wrap+ Designated Benefit Plan Fiduciary Liability Application\"",
    body: `<div style="text-align: center; padding: 40px;">
      <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 30px; background: #1a1a2e; padding: 12px 20px; border-radius: 8px;">
        <span style="font-size: 14px; color: #ccc;">One Trust MPMT Travelers Wrap+ ...</span>
        <span style="font-size: 12px; color: #888;">431 KB</span>
      </div>
      <div style="margin: 40px 0;">
        <div style="font-size: 48px; margin-bottom: 20px;">
          <img src="" alt="Adobe Acrobat Sign" style="width: 80px;" />
        </div>
        <div style="width: 64px; height: 64px; background: #0078d4; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="color: #e0e0e0; margin: 16px 0 8px;">You're done signing</h2>
        <h3 style="color: #e0e0e0; font-size: 18px; max-width: 500px; margin: 0 auto;">One Trust MPMT Travelers Wrap+ Designated Benefit Plan Fiduciary Liability Application</h3>
      </div>
      <a href="#" style="display: inline-block; background: #0078d4; color: white; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-size: 16px; margin: 20px 0;">Open agreement</a>
      <hr style="border-color: #333; margin: 30px 0;" />
      <p style="color: #aaa; font-size: 13px;">Attached is the final agreement for your reference. Read it with <b style="color: #e8564a;">Acrobat Reader</b>. You can also <b>open it online</b> to review its activity history.</p>
      <p style="color: #666; font-size: 11px; margin-top: 30px;">To ensure that you continue receiving our emails, please add adobesign@adobesign.com to your address book or safe list.</p>
    </div>`,
    date: today(8, 6),
    isRead: false,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: false,
    attachments: [
      { id: "att-1", name: "One Trust MPMT Travelers Wrap+.pdf", size: "431 KB", type: "application/pdf" },
    ],
  },
  {
    id: "email-2",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Robert Strauss", email: "robert.strauss@insurance.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Standard issue for every life insurance producer",
    preview: "Standard issue for every life insurance producer",
    body: "<p>Hi Hunter,</p><p>I wanted to follow up regarding the standard issue for every life insurance producer in our network. Please review the attached documentation and let me know if you have any questions.</p><p>Best regards,<br/>Robert Strauss</p>",
    date: today(7, 22),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
  },
  {
    id: "email-3",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Megan Kumm", email: "megan.kumm@strategicrisks.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Kennion Combined Cash Balance Report - February 2026",
    preview: "Kennion Combined Cash Balance Report - February 2026",
    body: "<p>Hi Hunter,</p><p>Please find attached the Kennion Combined Cash Balance Report for February 2026. All balances have been reconciled and verified.</p><p>Let me know if you need any clarification.</p><p>Best,<br/>Megan Kumm</p>",
    date: today(7, 10),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: false,
    attachments: [
      { id: "att-2", name: "Kennion_CashBalance_Feb2026.xlsx", size: "245 KB", type: "application/xlsx" },
    ],
  },
  {
    id: "email-4",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Hunter Shepherd", email: "hunter@kennion.com" },
    to: [{ name: "Team", email: "team@kennion.com" }],
    subject: "Sec Tournament Bracket",
    preview: "Sec Tournament Bracket",
    body: "<p>Hey everyone,</p><p>Here's the SEC Tournament Bracket for this year. Let me know your picks!</p><p>- Hunter</p>",
    date: today(7, 10),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
    importance: "normal",
    categories: [],
  },
  {
    id: "email-5",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Megan Kumm", email: "megan.kumm@strategicrisks.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "AEA MPMT February 2026 Cash Balance Report",
    preview: "AEA MPMT February 2026 Cash Balance Report",
    body: "<p>Hunter,</p><p>Attached is the AEA MPMT February 2026 Cash Balance Report for your review.</p><p>Thanks,<br/>Megan</p>",
    date: today(7, 10),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
  },
  {
    id: "email-6",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "tmsupport@servisfirstbank.com", email: "tmsupport@servisfirstbank.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "ServisFirst - ACH Positive Pay Notification",
    preview: "ServisFirst - ACH Positive Pay Notification",
    body: "<p>This is an automated notification regarding ACH Positive Pay activity on your account. Please log in to review and approve pending transactions.</p>",
    date: today(3, 12),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
  },
  // Yesterday (Tuesday)
  {
    id: "email-7",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Miller Bradford", email: "miller.bradford@benefits.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Re: Benefits for a small non-profit",
    preview: "Re: Benefits for a small non-profit",
    body: "<p>Hunter,</p><p>Thank you for the information. I've reviewed the benefits package options for the small non-profit and have some recommendations I'd like to discuss.</p><p>Can we schedule a call this week?</p><p>Miller Bradford</p>",
    date: yesterday(17, 48),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: false,
  },
  {
    id: "email-8",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Hal Shepherd", email: "hal@kennion.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Fw: May 14-15",
    preview: "Fw: May 14-15",
    body: "<p>Hunter,</p><p>Forwarding this for your reference regarding the May 14-15 event schedule.</p><p>- Hal</p>",
    date: yesterday(17, 26),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
  },
  {
    id: "email-9",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Lindsey Building", email: "lindsey@building.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Attached Image",
    preview: "Attached Image",
    body: "<p>Hi Hunter,</p><p>Please see the attached image as requested.</p><p>Thanks,<br/>Lindsey</p>",
    date: yesterday(15, 51),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: false,
  },
  {
    id: "email-10",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Bobby Reagan", email: "bobby.reagan@kennion.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "RE: Kennion Program Info For Call",
    preview: "RE: Kennion Program Info For Call",
    body: "<p>Hunter,</p><p>Here's the program info you requested for the upcoming call. I've included the key talking points and client details.</p><p>Bobby</p>",
    date: yesterday(15, 28),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: true,
  },
  {
    id: "email-11",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Kimberly Swink", email: "kimberly.swink@partners.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Re: Inquiry",
    preview: "Re: Inquiry",
    body: "<p>Hunter,</p><p>Following up on our previous conversation. I'd like to discuss the inquiry further at your earliest convenience.</p><p>Kimberly Swink</p>",
    date: yesterday(11, 4),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: true,
  },
  {
    id: "email-12",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Wilson Shepherd", email: "wilson@kennion.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Screenshot 2026-03-10 at 8.00.47 AM",
    preview: "Screenshot 2026-03-10 at 8.00.47 AM",
    body: "<p>See attached screenshot.</p>",
    date: yesterday(8, 1),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
  },
  // This week (Monday)
  {
    id: "email-13",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Whitney Bosley", email: "whitney.bosley@services.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Re: Information for Shepherd Family March 22-28",
    preview: "Re: Information for Shepherd Family March 22-28",
    body: "<p>Hunter,</p><p>Here's the updated information for the Shepherd Family trip March 22-28. Please review and confirm.</p><p>Whitney Bosley</p>",
    date: monday(9, 40),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: false,
  },
  // Last week
  {
    id: "email-14",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Kennion Support Email", email: "support@kennion.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Fwd: New Group: Going Coastal LLC",
    preview: "Fwd: New Group: Going Coastal LLC",
    body: "<p>New group has been created: Going Coastal LLC. Please review the details and assign accordingly.</p>",
    date: lastWed(9, 0),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: false,
    hasReplied: false,
  },
  {
    id: "email-15",
    accountId: "hunter",
    folderId: "hunter-inbox",
    from: { name: "Kennion Support Email", email: "support@kennion.com" },
    to: [{ name: "Hunter Shepherd", email: "hunter@kennion.com" }],
    subject: "Re: List Current Clients",
    preview: "Re: List Current Clients",
    body: "<p>Updated client list attached. Please review and let me know if any changes are needed.</p>",
    date: lastTue(10, 0),
    isRead: true,
    isFlagged: false,
    isStarred: false,
    hasAttachment: true,
    hasReplied: false,
  },
];

export function getEmailsByFolder(folderId: string): Email[] {
  return emails.filter((e) => e.folderId === folderId);
}

export function getEmailById(id: string): Email | undefined {
  return emails.find((e) => e.id === id);
}

export function groupEmailsByDate(emailList: Email[]): { label: string; emails: Email[] }[] {
  const now = new Date(2026, 2, 11);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000); // Sunday
  const lastWeekStart = new Date(weekStart.getTime() - 7 * 86400000);

  const groups: Record<string, Email[]> = {};
  const order = ["Today", "Yesterday", "This week", "Last week", "2025"];

  for (const email of emailList) {
    const d = email.date;
    let label: string;
    if (d >= todayStart) label = "Today";
    else if (d >= yesterdayStart) label = "Yesterday";
    else if (d >= weekStart) label = "This week";
    else if (d >= lastWeekStart) label = "Last week";
    else label = "2025";

    if (!groups[label]) groups[label] = [];
    groups[label].push(email);
  }

  // Sort emails within each group by date desc
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return order.filter((l) => groups[l]).map((l) => ({ label: l, emails: groups[l] }));
}
