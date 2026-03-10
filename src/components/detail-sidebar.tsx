"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Mail,
  Phone,
  Linkedin,
  Plus,
  Trash2,
  Send,
  Inbox,
  StickyNote,
  PhoneCall,
  Calendar,
  ArrowRightLeft,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactWithCompany } from "@/app/contacts/page";
import type { Activity, Json } from "@/lib/database.types";

// ── Activity Timeline ──

const activityIcons: Record<string, React.ReactNode> = {
  email_sent: <Send className="h-3.5 w-3.5" />,
  email_received: <Inbox className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
  call: <PhoneCall className="h-3.5 w-3.5" />,
  meeting: <Calendar className="h-3.5 w-3.5" />,
  status_change: <ArrowRightLeft className="h-3.5 w-3.5" />,
  task: <CheckSquare className="h-3.5 w-3.5" />,
  custom: <StickyNote className="h-3.5 w-3.5" />,
};

function ActivityItem({ activity }: { activity: Activity }) {
  const d = new Date(activity.occurred_at);
  return (
    <div className="flex gap-3 py-2.5 border-b last:border-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {activityIcons[activity.type] ?? activityIcons.custom}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{activity.title}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {activity.description}
          </p>
        )}
        <Badge variant="outline" className="mt-1 text-[10px]">
          {activity.type.replace("_", " ")}
        </Badge>
      </div>
    </div>
  );
}

// ── Attributes Editor (JSONB) ──

interface AttributesEditorProps {
  attributes: Record<string, unknown>;
  onSave: (attrs: Record<string, unknown>) => void;
}

function AttributesEditor({ attributes, onSave }: AttributesEditorProps) {
  const [entries, setEntries] = useState<[string, string][]>(() =>
    Object.entries(attributes ?? {}).map(([k, v]) => [k, String(v ?? "")])
  );
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (!newKey.trim()) return;
    const updated = [...entries, [newKey.trim(), newValue] as [string, string]];
    setEntries(updated);
    setNewKey("");
    setNewValue("");
    onSave(Object.fromEntries(updated));
  };

  const handleRemove = (idx: number) => {
    const updated = entries.filter((_, i) => i !== idx);
    setEntries(updated);
    onSave(Object.fromEntries(updated));
  };

  const handleValueChange = (idx: number, val: string) => {
    const updated = entries.map((e, i) =>
      i === idx ? ([e[0], val] as [string, string]) : e
    );
    setEntries(updated);
    onSave(Object.fromEntries(updated));
  };

  // Known attribute icons
  const attrIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("phone") || k.includes("tel"))
      return <Phone className="h-3.5 w-3.5" />;
    if (k.includes("linkedin"))
      return <Linkedin className="h-3.5 w-3.5" />;
    if (k.includes("email") || k.includes("mail"))
      return <Mail className="h-3.5 w-3.5" />;
    return null;
  };

  return (
    <div className="space-y-2">
      {entries.map(([key, val], idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 w-24 shrink-0">
            {attrIcon(key)}
            <span className="text-xs text-muted-foreground truncate capitalize">
              {key}
            </span>
          </div>
          <Input
            value={val}
            onChange={(e) => handleValueChange(idx, e.target.value)}
            className="h-7 text-xs flex-1"
          />
          <button
            onClick={() => handleRemove(idx)}
            className="text-muted-foreground hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Input
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="h-7 text-xs w-24 shrink-0"
        />
        <Input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="h-7 text-xs flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="text-muted-foreground hover:text-primary cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Detail Sidebar (Close.com style) ──

interface DetailSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactWithCompany | null;
  activities: Activity[];
  aiSummary: string | null;
  aiLoading: boolean;
  onGenerateSummary: () => void;
  onUpdateAttributes: (
    contactId: string,
    attributes: Record<string, unknown>
  ) => void;
}

export function DetailSidebar({
  open,
  onOpenChange,
  contact,
  activities,
  aiSummary,
  aiLoading,
  onGenerateSummary,
  onUpdateAttributes,
}: DetailSidebarProps) {
  if (!contact) return null;

  const attrs = (contact.attributes ?? {}) as Record<string, unknown>;
  const enrichment = (contact.enrichment ?? {}) as Record<string, unknown>;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent onClose={() => onOpenChange(false)}>
        <div className="flex flex-col h-full">
          {/* Contact header */}
          <div className="p-6 border-b space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {contact.name || contact.email.split("@")[0]}
                </h2>
                <p className="text-sm text-muted-foreground">{contact.email}</p>
              </div>
              {contact.company?.company_type && (
                <Badge
                  variant={
                    contact.company.company_type === "Current Client"
                      ? "success"
                      : contact.company.company_type === "Lead"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {contact.company.company_type}
                </Badge>
              )}
            </div>
            {contact.company && (
              <div className="text-sm">
                <span className="text-muted-foreground">Company: </span>
                <span className="font-medium">
                  {contact.company.company_name ?? contact.company.domain}
                </span>
              </div>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{contact.sent_count}</strong>{" "}
                sent
              </span>
              <span>
                <strong className="text-foreground">
                  {contact.received_count}
                </strong>{" "}
                received
              </span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-4 border-b space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Summary
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateSummary}
                disabled={aiLoading}
                className="h-7 text-xs"
              >
                {aiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {aiLoading ? "Generating..." : "Generate"}
              </Button>
            </div>
            {aiSummary && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 leading-relaxed">
                {aiSummary}
              </p>
            )}
          </div>

          {/* Attributes Editor */}
          <div className="p-4 border-b space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attributes
            </h3>
            <AttributesEditor
              attributes={attrs}
              onSave={(newAttrs) =>
                onUpdateAttributes(contact.id, newAttrs)
              }
            />
          </div>

          {/* Enrichment data (read-only) */}
          {Object.keys(enrichment).length > 0 && (
            <div className="p-4 border-b space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enrichment
              </h3>
              <div className="space-y-1">
                {Object.entries(enrichment).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground capitalize w-24 shrink-0">
                      {key}
                    </span>
                    <span className="truncate">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="flex-1 overflow-auto p-4 space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Activity Timeline
            </h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activities recorded yet.
              </p>
            ) : (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
