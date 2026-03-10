import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function companyTypeBadgeVariant(
  type: string | null | undefined
): "success" | "warning" | "secondary" | "outline" {
  switch (type) {
    case "Current Client":
      return "success";
    case "Lead":
      return "warning";
    case "Old Client":
      return "secondary";
    default:
      return "outline";
  }
}
