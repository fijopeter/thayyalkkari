import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface AuthSnapshot {
  session: Session | null;
  profile: Profile | null;
  /** True until the very first auth check completes — lets route guards avoid a flash of "logged out". */
  initializing: boolean;
}

// useSyncExternalStore requires getSnapshot to return a stable reference when
// nothing has changed, so we keep one mutable snapshot object and only swap
// it for a new one inside notify().
let snapshot: AuthSnapshot = { session: null, profile: null, initializing: true };

const subscribers = new Set<() => void>();
function notify(next: Partial<AuthSnapshot>) {
  snapshot = { ...snapshot, ...next };
  subscribers.forEach((cb) => cb());
}
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
function getSnapshot() {
  return snapshot;
}

async function loadProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  const profile: Profile | null = data
    ? { id: data.id, email: data.email, role: data.role, status: data.status, shopId: data.shop_id }
    : null;
  notify({ profile });
}

supabase.auth.onAuthStateChange((_event, newSession) => {
  notify({ session: newSession, initializing: false, profile: newSession ? snapshot.profile : null });
  if (newSession) void loadProfile(newSession.user.id);
});

export function useSession(): AuthSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export async function signUp(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signUp({ email, password });
  return error?.message ?? null;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Re-fetches the current user's profile — call after an action that changes it (e.g. after creating their shop). */
export async function refreshProfile(): Promise<void> {
  if (snapshot.session) await loadProfile(snapshot.session.user.id);
}
