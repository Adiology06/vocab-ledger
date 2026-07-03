import { useState } from "react";
import { pickBatchByCategory, getAllCategories } from "../lib/discoveryService";
import { fetchBatchDetails } from "../lib/discoveryService";
import QuizRunner from "./QuizRunner";

const COUNTS = [5, 10, 20, 30, 50];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ExamQuiz({
  userId,
  savedWordsList,
  onFinish,
  onRefresh,
}) {
  const [scope, setScope] = useState(null); // 'category' | 'both'
  const [category, setCategory] = useState(null);
  const [count, setCount] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [pool, setPool] = useState(null);

  const categories = getAllCategories();

  const start = async () => {
    setLoading(true);
    const batch = pickBatchByCategory(
      category,
      savedWordsList.map((w) => w.word),
      count,
    );
    const fetched = await fetchBatchDetails(batch, difficulty, (done, total) =>
      setProgress({ done, total }),
    );
    const withDifficulty = fetched.map((w) => ({ ...w, difficulty }));

    let finalPool = withDifficulty;
    if (scope === "both") {
      const savedMatches = savedWordsList.filter((w) => {
        const catMatch =
          category === "All" || (w.category || "General") === category;
        return catMatch && w.difficulty === difficulty;
      });
      const existingWords = new Set(withDifficulty.map((w) => w.word));
      finalPool = [
        ...withDifficulty,
        ...savedMatches.filter((w) => !existingWords.has(w.word)),
      ];
    }

    setPool(finalPool);
    setLoading(false);
  };

  // Step 1 — scope
  if (!scope) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 24 }}>
            Exam prep quiz
          </div>
          <div
            className="level-row"
            style={{ justifyContent: "center", marginTop: 20 }}
          >
            <button className="level-chip" onClick={() => setScope("category")}>
              Category words only
            </button>
            <button className="level-chip" onClick={() => setScope("both")}>
              Category + my saved words
            </button>
          </div>
          <button className="quiz-exit-btn" onClick={() => onFinish(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Step 2 — category
  if (!category) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 22 }}>
            Choose exam category
          </div>
          <div
            className="level-row"
            style={{
              justifyContent: "center",
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {categories.map((c) => (
              <button
                key={c}
                className="level-chip"
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="quiz-exit-btn" onClick={() => setScope(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3 — count
  if (!count) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 22 }}>
            How many words?
          </div>
          <div
            className="level-row"
            style={{ justifyContent: "center", marginTop: 20 }}
          >
            {COUNTS.map((n) => (
              <button
                key={n}
                className="level-chip"
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button className="quiz-exit-btn" onClick={() => setCategory(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // Step 4 — difficulty
  if (!difficulty) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 22 }}>
            Choose difficulty
          </div>
          <div
            className="level-row"
            style={{ justifyContent: "center", marginTop: 20 }}
          >
            {LEVELS.map((l) => (
              <button
                key={l}
                className="level-chip"
                onClick={() => {
                  setDifficulty(l);
                  start();
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="quiz-exit-btn" onClick={() => setCount(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-progress">
            Preparing quiz… {progress.done} / {progress.total || count}
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizRunner
      pool={pool || []}
      label={`${category} · ${difficulty}`}
      userId={userId}
      onFinish={onFinish}
      onRefresh={onRefresh}
    />
  );
}
