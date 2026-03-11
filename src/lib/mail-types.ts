export interface EmailAccount {
  id: string;
  email: string;
  displayName: string;
  folders: EmailFolder[];
}

export interface EmailFolder {
  id: string;
  name: string;
  icon?: string;
  unreadCount?: number;
  children?: EmailFolder[];
  type?: "inbox" | "sent" | "drafts" | "deleted" | "junk" | "archive" | "notes" | "outbox" | "custom";
  color?: string;
  flagIcon?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Email {
  id: string;
  accountId: string;
  folderId: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  bcc?: { name: string; email: string }[];
  subject: string;
  preview: string;
  body: string;
  date: Date;
  isRead: boolean;
  isFlagged: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  hasReplied: boolean;
  attachments?: EmailAttachment[];
  importance?: "low" | "normal" | "high";
  categories?: string[];
}

export type EmailSortField = "date" | "from" | "subject" | "size";
export type EmailSortDirection = "asc" | "desc";

export interface MailState {
  selectedAccountId: string | null;
  selectedFolderId: string;
  selectedEmailId: string | null;
  searchQuery: string;
  sortField: EmailSortField;
  sortDirection: EmailSortDirection;
}
