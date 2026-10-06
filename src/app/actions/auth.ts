"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/schemas";

export type AuthResult = { error: string } | undefined;

export async function signUp(input: unknown): Promise<AuthResult> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) return { error: error.message };
  if (!data.session) return { error: "Account created. Check your email to confirm it." };
  redirect("/");
}

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
