import { useMemo, useState } from "react";
import { reviewWord } from "../lib/reviewService";
import { saveWord } from "../lib/wordsService";
import { generateQuestion } from "../lib/quizLogic";
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
export default function QuizRunner({
  pool: rawPool,
  label,
  userId,
  onFinish,
  onRefresh,
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [tally, setTally] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [savedMap, setSavedMap] = useState({});
  const [finished, setFinished] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const pool = useMemo(() => shuffle(rawPool), [rawPool, attemptKey]);

  const question = useMemo(
    () => (pool[index] ? generateQuestion(pool[index], pool) : null),
    [index, pool, attemptKey],
  );

  if (!pool.length) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 20 }}>
            No words available for this quiz yet
          </div>
          <button className="quiz-exit-btn" onClick={() => onFinish(null)}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const current = pool[index];
  const isLast = index === pool.length - 1;
  const isCorrect = selected === question.correctAnswer;
  const alreadySaved = !!current.id || !!savedMap[current.word];
  const attempted = tally.correct + tally.wrong;

  const handleSave = async () => {
    if (!userId || alreadySaved) return;
    const { data } = await saveWord(userId, {
      ...current,
      difficulty: current.difficulty || "Beginner",
      category: current.category || "General",
      source: "quiz",
    });
    if (data) {
      setSavedMap((m) => ({ ...m, [current.word]: true }));
      onRefresh?.();
    }
  };

  const finishNow = () => {
    onRefresh?.();
    setFinished(true);
  };

  const handleSkip = () => {
    const newTally = { ...tally, skipped: tally.skipped + 1 };
    setTally(newTally);
    if (isLast) finishNow();
    else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleNext = async () => {
    const mark = isCorrect ? "remembered" : "forgot";
    if (current.id) await reviewWord(current.id, current.review_stage, mark);
    const newTally = {
      ...tally,
      correct: tally.correct + (isCorrect ? 1 : 0),
      wrong: tally.wrong + (isCorrect ? 0 : 1),
    };
    setTally(newTally);
    if (isLast) finishNow();
    else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRetry = () => {
    setIndex(0);
    setSelected(null);
    setTally({ correct: 0, wrong: 0, skipped: 0 });
    setFinished(false);
    setAttemptKey((k) => k + 1);
  };

  if (finished) {
    const total = tally.correct + tally.wrong + tally.skipped;
    const pct = attempted ? Math.round((tally.correct / attempted) * 100) : 0;
    return (
      <div className="quiz-overlay">
        <div className="quiz-card">
          <div className="quiz-word" style={{ fontSize: 24 }}>
            Quiz complete{label ? ` · ${label}` : ""}
          </div>
          <div className="score-grid">
            <div className="score-box correct">
              <div className="score-num">{tally.correct}</div>
              <div className="score-label">Correct</div>
            </div>
            <div className="score-box wrong">
              <div className="score-num">{tally.wrong}</div>
              <div className="score-label">Wrong</div>
            </div>
            <div className="score-box skipped">
              <div className="score-num">{tally.skipped}</div>
              <div className="score-label">Skipped</div>
            </div>
          </div>
          <div className="score-summary">
            {attempted} attempted of {total} · {pct}% accuracy
          </div>
          <div
            className="stamp-btns"
            style={{ justifyContent: "center", marginTop: 22 }}
          >
            <button className="quiz-reveal-btn" onClick={handleRetry}>
              Retry this quiz
            </button>
            <button
              className="quiz-exit-btn"
              style={{ margin: 0 }}
              onClick={() => onFinish(tally)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-overlay">
      <div className="quiz-card">
        <div className="quiz-progress">
          {index + 1} / {pool.length}
          {label ? ` · ${label}` : ""} · ✓{tally.correct} ✕{tally.wrong} ⤼
          {tally.skipped}
        </div>

        <div className="quiz-toolbar">
          <button className="skip-btn" onClick={handleSkip}>
            Skip →
          </button>
          {!alreadySaved && userId && (
            <button className="save-word-btn" onClick={handleSave}>
              + Save to my words
            </button>
          )}
          {alreadySaved && <span className="saved-tag">✓ in your list</span>}
        </div>

        <div className="quiz-question">{question.prompt}</div>

        <div className="quiz-options">
          {question.options.map((opt) => {
            let cls = "quiz-option";
            if (selected) {
              if (opt.isCorrect) cls += " correct";
              else if (opt.text === selected) cls += " wrong";
            }
            return (
              <div key={opt.text} className="option-wrap">
                <button
                  className={cls}
                  disabled={!!selected}
                  onClick={() => setSelected(opt.text)}
                >
                  {opt.text}
                </button>
                {selected && opt.detail && (
                  <div className="option-detail">{opt.detail}</div>
                )}
              </div>
            );
          })}
        </div>

        {selected && (
          <button
            className="quiz-reveal-btn"
            onClick={handleNext}
            style={{ marginTop: 20 }}
          >
            {isLast ? "See results" : "Next word"}
          </button>
        )}

        <button className="quiz-exit-btn" onClick={() => onFinish(tally)}>
          Exit quiz
        </button>
      </div>
    </div>
  );
}
