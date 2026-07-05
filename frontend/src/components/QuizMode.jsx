import { useState } from "react";
import QuizRunner from "./QuizRunner";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function QuizMode({ wordPool, userId, onFinish, onRefresh }) {
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [frozenPool, setFrozenPool] = useState(null);

  const categories = [
    "All",
    ...Array.from(new Set(wordPool.map((w) => w.category || "General"))).sort(),
  ];

  const chooseDifficulty = (l) => {
    setDifficulty(l);
    const filtered = wordPool.filter((w) => {
      const catMatch =
        category === "All" || (w.category || "General") === category;
      const diffMatch = l === "All" || w.difficulty === l;
      return catMatch && diffMatch;
    });
    setFrozenPool(filtered); // snapshot taken once, won't change during the quiz
  };

  if (!category) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 24 }}>
            Choose a category
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
          <button className="quiz-exit-btn" onClick={() => onFinish(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 24 }}>
            Choose difficulty
          </div>
          <div className="quiz-progress" style={{ marginTop: 8 }}>
            Category: {category}
          </div>
          <div
            className="level-row"
            style={{ justifyContent: "center", marginTop: 20 }}
          >
            {LEVELS.map((l) => (
              <button
                key={l}
                className="level-chip"
                onClick={() => chooseDifficulty(l)}
              >
                {l}
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

  return (
    <QuizRunner
      pool={frozenPool || []}
      label={`${category} · ${difficulty}`}
      userId={userId}
      onFinish={onFinish}
      onRefresh={onRefresh}
    />
  );
}
