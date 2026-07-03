import { supabase } from "../supabaseClient";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) console.error("getProfile error:", error.message);
  return data;
}

export async function upsertProfile(userId, profile) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });
  if (error) console.error("upsertProfile error:", error.message);
  return { error };
}
