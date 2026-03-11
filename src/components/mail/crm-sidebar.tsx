"use client";

import {
  X,
  Building2,
  Phone,
  Mail,
  Tag,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingUp,
  User,
  StickyNote,
  BarChart3,
  Send,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useMailStore } from "@/stores/mail-store";
import { useEmail } from "@/hooks/use-emails";
import { useCrmContactByEmail } from "@/hooks/use-crm-contact";
import type { DealData } from "@/stores/crm-store";

const stageColors: Record<string, string> = {
  lead: "bg-gray-500",
  qualified: "bg-blue-500",
  proposal: "bg-yellow-500",
  negotiation: "bg-orange-500",
  closed_won: "bg-green-500",
  closed_lost: "bg-red-500",
};

const stageLabels: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const typeColors: Record<string, string> = {
  lead: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  contact: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  customer: "bg-green-500/20 text-green-400 border-green-500/30",
  vendor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  partner: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

function DealCard({ deal }: { deal: DealData }) {
  const stageIdx = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"].indexOf(deal.stage);
  const totalStages = 5; // exclude closed_lost from progress

  return (
    <div className="bg-[#2a2a3d] rounded-lg p-3 border border-[#3a3a4d]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-white leading-tight">{deal.title}</span>
        <ChevronRight size={14} className="text-gray-500 shrink-0 mt-0.5" />
      </div>
      {deal.value && (
        <div className="flex items-center gap-1 mt-1.5">
          <DollarSign size={12} className="text-green-400" />
          <span className="text-[13px] text-green-400 font-semibold">
            {deal.value.toLocaleString()} {deal.currency}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span
          className={cn(
            "text-[11px] px-1.5 py-0.5 rounded-full font-medium text-white",
            stageColors[deal.stage] || "bg-gray-500"
          )}
        >
          {stageLabels[deal.stage] || deal.stage}
        </span>
        {deal.probability !== null && (
          <span className="text-[11px] text-gray-400">{deal.probability}% prob.</span>
        )}
      </div>
      {/* Stage progress bar */}
      <div className="flex gap-0.5 mt-2">
        {Array.from({ length: totalStages }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= stageIdx && deal.stage !== "closed_lost"
                ? stageColors[deal.stage]
                : "bg-[#3a3a4d]"
            )}
          />
        ))}
      </div>
      {deal.expectedClose && (
        <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
          <Clock size={10} />
          <span>Expected close: {new Date(deal.expectedClose).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}

export function CrmSidebar() {
  const { selectedEmailId, crmSidebarOpen, setCrmSidebarOpen } = useMailStore();
  const { data: email } = useEmail(selectedEmailId);
  const { data: contact, isLoading } = useCrmContactByEmail(email?.from.email ?? null);

  if (!crmSidebarOpen || !selectedEmailId) return null;

  return (
    <div className="w-[280px] bg-[#1e1e2e] border-l border-[#2a2a3a] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333] shrink-0">
        <div className="flex items-center gap-2">
          <User size={16} className="text-[#0078d4]" />
          <span className="text-[13px] font-semibold text-white">CRM Contact</span>
        </div>
        <button
          className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"
          onClick={() => setCrmSidebarOpen(false)}
        >
          <X size={14} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#0078d4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !contact ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#2a2a3d] flex items-center justify-center mx-auto mb-3">
              <User size={24} className="text-gray-500" />
            </div>
            <p className="text-[13px] text-gray-400 mb-1">No CRM record found</p>
            <p className="text-[11px] text-gray-500 mb-3">
              {email?.from.email}
            </p>
            <button className="text-[12px] bg-[#0078d4] text-white px-3 py-1.5 rounded hover:bg-[#106ebe] transition-colors">
              + Create Contact
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {/* Contact header */}
            <div className="flex items-start gap-3">
              <Avatar fallback={contact.name || contact.email} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-white truncate">
                  {contact.name || contact.email}
                </h3>
                {contact.jobTitle && (
                  <p className="text-[12px] text-gray-400 truncate">{contact.jobTitle}</p>
                )}
                <span
                  className={cn(
                    "inline-block mt-1 text-[11px] px-1.5 py-0.5 rounded border font-medium",
                    typeColors[contact.type] || typeColors.contact
                  )}
                >
                  {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2">
              {contact.company && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Building2 size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-300 truncate">{contact.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[12px]">
                <Mail size={14} className="text-gray-500 shrink-0" />
                <span className="text-blue-400 truncate">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Phone size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-300">{contact.phone}</span>
                </div>
              )}
            </div>

            {/* Email stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#2a2a3d] rounded-lg p-2.5 border border-[#3a3a4d]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Send size={12} className="text-blue-400" />
                  <span className="text-[11px] text-gray-400">Sent</span>
                </div>
                <span className="text-[18px] font-bold text-white">{contact.sentCount}</span>
              </div>
              <div className="bg-[#2a2a3d] rounded-lg p-2.5 border border-[#3a3a4d]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Inbox size={12} className="text-green-400" />
                  <span className="text-[11px] text-gray-400">Received</span>
                </div>
                <span className="text-[18px] font-bold text-white">{contact.receivedCount}</span>
              </div>
            </div>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag size={12} className="text-gray-400" />
                  <span className="text-[12px] font-medium text-gray-400">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-[#2a2a3d] text-gray-300 px-2 py-0.5 rounded-full border border-[#3a3a4d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-[#333]" />

            {/* Deals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-[#0078d4]" />
                  <span className="text-[12px] font-semibold text-white">
                    Deals ({contact.deals.length})
                  </span>
                </div>
                <button className="text-[11px] text-[#0078d4] hover:text-blue-300 transition-colors">
                  + New Deal
                </button>
              </div>
              {contact.deals.length === 0 ? (
                <p className="text-[12px] text-gray-500 text-center py-2">No deals yet</p>
              ) : (
                <div className="space-y-2">
                  {contact.deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>

            {/* Deal pipeline summary */}
            {contact.deals.length > 0 && (
              <div className="bg-[#2a2a3d] rounded-lg p-3 border border-[#3a3a4d]">
                <div className="flex items-center gap-1.5 mb-2">
                  <BarChart3 size={12} className="text-gray-400" />
                  <span className="text-[11px] text-gray-400">Pipeline Value</span>
                </div>
                <span className="text-[18px] font-bold text-green-400">
                  ${contact.deals
                    .filter((d) => d.stage !== "closed_lost")
                    .reduce((sum, d) => sum + (d.value || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            )}

            <Separator className="bg-[#333]" />

            {/* Notes */}
            {contact.notes && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <StickyNote size={12} className="text-yellow-400" />
                  <span className="text-[12px] font-medium text-gray-400">Notes</span>
                </div>
                <p className="text-[12px] text-gray-300 leading-relaxed bg-[#2a2a3d] rounded-lg p-2.5 border border-[#3a3a4d]">
                  {contact.notes}
                </p>
              </div>
            )}

            {/* Recent activity */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={12} className="text-gray-400" />
                <span className="text-[12px] font-medium text-gray-400">Recent Activity</span>
              </div>
              <div className="space-y-2">
                {contact.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                        activity.type.includes("sent") ? "bg-blue-400" : "bg-green-400"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-300 truncate">{activity.title}</p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(activity.occurredAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
