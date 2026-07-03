import { supabase } from "../supabaseClient";

const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

export function computeNextReview(currentStage, mark) {
  let newStage;
  if (mark === "remembered") {
    newStage = Math.min((currentStage ?? 0) + 1, INTERVALS_DAYS.length - 1);
  } else {
    newStage = 0;
  }
  const daysAhead = INTERVALS_DAYS[newStage];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + daysAhead);
  return { newStage, nextReview: nextReview.toISOString() };
}

export async function reviewWord(id, currentStage, mark) {
  const { newStage, nextReview } = computeNextReview(currentStage, mark);
  const { error } = await supabase
    .from("words")
    .update({
      status: mark,
      review_stage: newStage,
      next_review: nextReview,
      last_reviewed: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("reviewWord error:", error.message);
  return { error };
}

export async function getDueWords(userId) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("user_id", userId)
    .or(`next_review.is.null,next_review.lte.${nowIso}`)
    .order("next_review", { ascending: true, nullsFirst: true })
    .limit(20);
  if (error) {
    console.error("getDueWords error:", error.message);
    return [];
  }
  return data;
}
