// Mock Supabase client for demo mode — returns demo data via the same
// chaining API that the real @supabase/supabase-js client exposes.

import { demoCompanies, demoContacts, demoActivities } from "./demo-data";

type Row = Record<string, unknown>;

// Simple in-memory store so updates persist during the session
const store: Record<string, Row[]> = {
  contacts: structuredClone(demoContacts) as unknown as Row[],
  companies: structuredClone(demoCompanies) as unknown as Row[],
  activities: structuredClone(demoActivities) as unknown as Row[],
};

function getTable(name: string): Row[] {
  return store[name] ?? [];
}

/** Minimal query builder that mimics SupabaseClient.from().select().eq()... */
class MockQueryBuilder {
  private table: string;
  private rows: Row[];
  private isUpdate = false;
  private updatePayload: Record<string, unknown> | null = null;

  constructor(table: string) {
    this.table = table;
    this.rows = [...getTable(table)];
  }

  select(_cols?: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return this;
  }

  eq(col: string, val: unknown) {
    this.rows = this.rows.filter((r) => r[col] === val);
    return this;
  }

  or(expr: string) {
    // Parse simple "col.eq.val,col.eq.val" expressions
    const parts = expr.split(",");
    const all = getTable(this.table);
    const matchIds = new Set<unknown>();
    for (const part of parts) {
      const m = part.trim().match(/^(\w+)\.eq\.(.+)$/);
      if (m) {
        const [, col, val] = m;
        for (const row of all) {
          if (String(row[col]) === val) matchIds.add(row["id"]);
        }
      }
    }
    this.rows = this.rows.filter((r) => matchIds.has(r["id"]));
    return this;
  }

  order(_col: string, _opts?: { ascending?: boolean }) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Data is already sorted in demo-data
    return this;
  }

  limit(n: number) {
    this.rows = this.rows.slice(0, n);
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.isUpdate = true;
    this.updatePayload = payload;
    return this;
  }

  // Terminal — resolves the query
  then(resolve: (result: { data: Row[] | null; error: null }) => void) {
    if (this.isUpdate && this.updatePayload) {
      // Apply update to matching rows in store
      const tableRows = getTable(this.table);
      for (const row of tableRows) {
        if (this.rows.some((r) => r["id"] === row["id"])) {
          Object.assign(row, this.updatePayload);
        }
      }
    }
    resolve({ data: this.rows, error: null });
  }
}

// Fake auth that does nothing
const noopAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
  signUp: () => Promise.resolve({ data: { user: null }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
};

export const mockSupabase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: noopAuth,
} as unknown as ReturnType<typeof import("@supabase/supabase-js").createClient>;
