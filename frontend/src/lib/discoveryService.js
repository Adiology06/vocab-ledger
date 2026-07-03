import wordBank from "../data/wordBank.json";
import { lookupWord } from "./wordLookup";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function pickBatch(excludeWords, size) {
  const excludeSet = new Set(excludeWords.map((w) => w.toLowerCase()));
  const pool = wordBank.filter((w) => !excludeSet.has(w.word.toLowerCase()));
  return shuffle(pool).slice(0, size);
}

// fetch in small chunks so we don't hammer the free APIs all at once
export async function fetchBatchDetails(batch, level, onProgress) {
  const results = [];
  const chunkSize = 5;
  for (let i = 0; i < batch.length; i += chunkSize) {
    const chunk = batch.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async (entry) => {
        const data = await lookupWord(entry.word, level);
        return data?.notFound ? null : { ...data, category: entry.category };
      }),
    );
    results.push(...chunkResults.filter(Boolean));
    onProgress?.(results.length, batch.length);
  }
  return results;
}

export function pickBatchByCategory(category, excludeWords, size) {
  const excludeSet = new Set(excludeWords.map((w) => w.toLowerCase()));
  let pool = wordBank.filter((w) => !excludeSet.has(w.word.toLowerCase()));
  if (category !== "All") pool = pool.filter((w) => w.category === category);
  return shuffle(pool).slice(0, size);
}

export function getAllCategories() {
  return [
    "All",
    ...Array.from(new Set(wordBank.map((w) => w.category))).sort(),
  ];
}
