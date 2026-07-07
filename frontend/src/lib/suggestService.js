const DATAMUSE_API = "https://api.datamuse.com/words?";

export async function fetchSuggestions(prefix, savedWords) {
  if (!prefix || prefix.length < 2) return [];

  // instant local matches from words you've already saved
  const localMatches = savedWords
    .map((w) => w.word)
    .filter((w) => w.toLowerCase().startsWith(prefix.toLowerCase()));

  // live matches from Datamuse's prefix-spelling search
  let apiMatches = [];
  try {
    const res = await fetch(
      `${DATAMUSE_API}sp=${encodeURIComponent(prefix)}*&max=8`,
    );
    const json = await res.json();
    apiMatches = json.map((x) => x.word);
  } catch {
    /* ignore — local matches still work */
  }

  const combined = [...localMatches, ...apiMatches];
  return [...new Set(combined)].slice(0, 8); // dedupe, cap at 8
}
