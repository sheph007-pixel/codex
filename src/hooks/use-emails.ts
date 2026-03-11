import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  emails as allEmails,
  groupEmailsByDate,
  getEmailById,
} from "@/lib/mail-data";
import type { Email } from "@/lib/mail-types";

// ──── Fetch emails for a folder (uses local data for now, swap for API later) ────

export function useEmails(folderId: string, searchQuery: string = "") {
  return useQuery({
    queryKey: ["emails", folderId, searchQuery],
    queryFn: async () => {
      // Simulate network delay for realistic feel
      await new Promise((r) => setTimeout(r, 50));

      let result = allEmails.filter((e) => e.folderId === folderId);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (e) =>
            e.subject.toLowerCase().includes(q) ||
            e.from.name.toLowerCase().includes(q) ||
            e.from.email.toLowerCase().includes(q) ||
            e.preview.toLowerCase().includes(q)
        );
      }
      return result;
    },
  });
}

export function useGroupedEmails(folderId: string, searchQuery: string = "") {
  const query = useEmails(folderId, searchQuery);
  const grouped = query.data ? groupEmailsByDate(query.data) : [];
  return { ...query, grouped };
}

export function useEmail(emailId: string | null) {
  return useQuery({
    queryKey: ["email", emailId],
    queryFn: async () => {
      if (!emailId) return null;
      await new Promise((r) => setTimeout(r, 20));
      return getEmailById(emailId) ?? null;
    },
    enabled: !!emailId,
  });
}

// ──── Optimistic mutations ────

export function useArchiveEmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      // In real app: call API to archive
      await new Promise((r) => setTimeout(r, 200));
      return emailId;
    },
    onMutate: async (emailId) => {
      // Optimistically remove from all email lists
      await qc.cancelQueries({ queryKey: ["emails"] });

      const previousQueries = qc.getQueriesData({ queryKey: ["emails"] });

      qc.setQueriesData(
        { queryKey: ["emails"] },
        (old: Email[] | undefined) =>
          old ? old.filter((e) => e.id !== emailId) : []
      );

      return { previousQueries };
    },
    onError: (_err, _emailId, context) => {
      // Rollback on error
      context?.previousQueries.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useDeleteEmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      await new Promise((r) => setTimeout(r, 200));
      return emailId;
    },
    onMutate: async (emailId) => {
      await qc.cancelQueries({ queryKey: ["emails"] });

      const previousQueries = qc.getQueriesData({ queryKey: ["emails"] });

      qc.setQueriesData(
        { queryKey: ["emails"] },
        (old: Email[] | undefined) =>
          old ? old.filter((e) => e.id !== emailId) : []
      );

      return { previousQueries };
    },
    onError: (_err, _emailId, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useToggleRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, isRead }: { emailId: string; isRead: boolean }) => {
      await new Promise((r) => setTimeout(r, 100));
      return { emailId, isRead };
    },
    onMutate: async ({ emailId, isRead }) => {
      await qc.cancelQueries({ queryKey: ["emails"] });

      qc.setQueriesData(
        { queryKey: ["emails"] },
        (old: Email[] | undefined) =>
          old
            ? old.map((e) => (e.id === emailId ? { ...e, isRead } : e))
            : []
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}
