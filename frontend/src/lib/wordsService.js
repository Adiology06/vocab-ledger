import { supabase } from "../supabaseClient";

export async function saveWord(userId, data) {
  const payload = {
    user_id: userId,
    word: data.word,
    hindi_meaning: data.hindi_meaning,
    definition: data.definition,
    pos: data.pos,
    prefix: data.prefix,
    suffix: data.suffix,
    ipa: data.ipa,
    hindi_pron: data.hindi_pron,
    synonyms: data.synonyms,
    antonyms: data.antonyms,
    example: data.example,
    difficulty: data.difficulty || "Beginner",
    category: data.category || "General",
    source: data.source || "search",
    status: "new",
  };
  const { data: saved, error } = await supabase
    .from("words")
    .upsert(payload, { onConflict: "user_id,word", ignoreDuplicates: false })
    .select()
    .single();
  if (error) console.error("saveWord error:", error.message);
  return { data: saved, error };
}

export async function fetchSavedWords(userId) {
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("user_id", userId)
    .order("last_reviewed", { ascending: false, nullsFirst: false })
    .order("first_saved", { ascending: false });
  if (error) {
    console.error("fetchSavedWords error:", error.message);
    return [];
  }
  return data;
}

export async function updateWordStatus(id, status) {
  const { error } = await supabase
    .from("words")
    .update({ status, last_reviewed: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("updateWordStatus error:", error.message);
}

export async function deleteWord(id) {
  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) console.error("deleteWord error:", error.message);
}
