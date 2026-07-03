import { useState } from "react";
import { pickBatch, fetchBatchDetails } from "../lib/discoveryService";
import { saveWord } from "../lib/wordsService";
import WordCard from "./WordCard";

const BATCH_SIZES = [5, 10, 20, 30, 50, 100];

export default function DiscoverMode({
  userId,
  level,
  savedWordsList,
  onFinish,
  onRefresh,
}) {
  const [size, setSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [savedMap, setSavedMap] = useState({});

  const start = async (batchSize) => {
    setSize(batchSize);
    setLoading(true);
    const batch = pickBatch(
      savedWordsList.map((w) => w.word),
      batchSize,
    );
    if (!batch.length) {
      setLoading(false);
      setWords([]);
      return;
    }

    const details = await fetchBatchDetails(batch, level, (done, total) =>
      setProgress({ done, total }),
    );
    setWords(details.map((w) => ({ ...w, difficulty: level })));
    setLoading(false);
  };

  const handleSave = async (word) => {
    const { data } = await saveWord(userId, { ...word, source: "wordbank" });
    if (data) {
      setSavedMap((m) => ({ ...m, [word.word]: true }));
      onRefresh?.();
    }
  };

  if (!size) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 22 }}>
            How many new words today?
          </div>
          <div
            className="level-row"
            style={{
              justifyContent: "center",
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {BATCH_SIZES.map((n) => (
              <button key={n} className="level-chip" onClick={() => start(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="disclaimer" style={{ marginTop: 14 }}>
            Larger batches (50–100) take longer to fetch.
          </div>
          <button className="quiz-exit-btn" onClick={() => onFinish()}>
            Cancel
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
            Fetching {progress.done} / {progress.total || size}…
          </div>
        </div>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 20 }}>
            You've already learned every word bank entry in this range
          </div>
          <button className="quiz-exit-btn" onClick={() => onFinish()}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const current = words[index];
  const isLast = index === words.length - 1;

  return (
    <div className="quiz-overlay">
      <div className="quiz-card" style={{ maxWidth: 560, textAlign: "left" }}>
        <div className="quiz-progress" style={{ textAlign: "center" }}>
          {index + 1} / {words.length} · {current.category}
        </div>
        <WordCard
          data={current}
          hideReview
          onSearchRelated={() => {}}
          onSave={() => handleSave(current)}
          isSaved={!!savedMap[current.word]}
        />
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 4 }}
        >
          <button
            className="quiz-reveal-btn"
            onClick={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
          >
            {isLast ? "Done for today" : "Next word"}
          </button>
        </div>
        <button className="quiz-exit-btn" onClick={() => onFinish()}>
          Exit
        </button>
      </div>
    </div>
  );
}
