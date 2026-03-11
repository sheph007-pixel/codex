"use client";

import {
  Mail,
  Calendar,
  Users,
  CheckSquare,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeApp: string;
  onSelectApp: (app: string) => void;
}

const apps = [
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "contacts", icon: Users, label: "People" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "more", icon: MoreHorizontal, label: "More" },
];

export function AppSidebar({ activeApp, onSelectApp }: AppSidebarProps) {
  return (
    <div className="w-[48px] bg-[#1a1a28] border-r border-[#333] flex flex-col items-center py-2 gap-1">
      {apps.map((app) => (
        <button
          key={app.id}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded transition-colors",
            activeApp === app.id
              ? "bg-[#0078d4] text-white"
              : "text-gray-400 hover:bg-[#2a2a3a] hover:text-white"
          )}
          onClick={() => onSelectApp(app.id)}
          title={app.label}
        >
          <app.icon size={20} />
        </button>
      ))}
    </div>
  );
}
