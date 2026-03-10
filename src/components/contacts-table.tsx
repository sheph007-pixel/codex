"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowUpDown } from "lucide-react";
import { cn, companyTypeBadgeVariant } from "@/lib/utils";
import type { ContactWithCompany } from "@/app/contacts/page";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ContactsTableProps {
  data: ContactWithCompany[];
  onSelectContact: (contact: ContactWithCompany) => void;
}

export function ContactsTable({ data, onSelectContact }: ContactsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "last_activity_date", desc: true },
  ]);

  const columns = useMemo<ColumnDef<ContactWithCompany>[]>(
    () => [
      {
        accessorKey: "is_starred",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <Star
            className={cn(
              "h-4 w-4",
              row.original.is_starred
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {row.original.name || row.original.email.split("@")[0]}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        id: "company",
        accessorFn: (row) => row.company?.company_name ?? row.company?.domain,
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">
              {row.original.company?.company_name ?? "-"}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.company?.domain}
            </span>
          </div>
        ),
      },
      {
        id: "type",
        accessorFn: (row) => row.company?.company_type,
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.company?.company_type;
          return <Badge variant={companyTypeBadgeVariant(type)}>{type ?? "Unknown"}</Badge>;
        },
        size: 100,
      },
      {
        accessorKey: "sent_count",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sent
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        size: 70,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">{row.original.sent_count}</span>
        ),
      },
      {
        accessorKey: "received_count",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Recv
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        size: 70,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.received_count}
          </span>
        ),
      },
      {
        accessorKey: "last_activity_date",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Active
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.last_activity_date)}
          </span>
        ),
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card border-b z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs uppercase tracking-wider"
                  style={{
                    width: header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-muted-foreground"
              >
                No contacts found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onSelectContact(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
