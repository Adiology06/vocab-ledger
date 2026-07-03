import { supabase } from "../supabaseClient";

const MAX_AGE_DAYS = 90; // refresh cache occasionally in case source APIs improve

export async function getCachedWord(word) {
  const { data, error } = await supabase
    .from("word_cache")
    .select("*")
    .eq("word", word.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;

  const ageDays = (Date.now() - new Date(data.fetched_at).getTime()) / 86400000;
  if (ageDays > MAX_AGE_DAYS) return null;

  return data.data;
}

export async function setCachedWord(word, wordData) {
  const clean = { ...wordData }
  delete clean.notFound
  await supabase
    .from("word_cache")
    .upsert({ word: word.toLowerCase(), data: clean, fetched_at: new Date().toISOString() })
}
