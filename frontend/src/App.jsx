import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import UserMenu from "./components/UserMenu";
import WordCard from "./components/WordCard";
import SavedList from "./components/SavedList";
import { lookupWord } from "./lib/wordLookup";
import QuizMode from "./components/QuizMode";
import { getDueWords } from "./lib/reviewService";
import ExamQuiz from "./components/ExamQuiz";
import DiscoverMode from "./components/DiscoverMode";
import { exportWordsToCSV } from "./lib/exportService";
import {
  saveWord,
  fetchSavedWords,
  updateWordStatus,
  deleteWord,
} from "./lib/wordsService";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [savedWords, setSavedWords] = useState([]);
  const [level, setLevel] = useState("Beginner");
  const [dueWords, setDueWords] = useState([]);
  const [quizActive, setQuizActive] = useState(false);
  const [quizSummary, setQuizSummary] = useState(null);
  const [discoverActive, setDiscoverActive] = useState(false);
  const [practiceActive, setPracticeActive] = useState(false);
  const [examQuizActive, setExamQuizActive] = useState(false);

  const refreshSavedWords = async (uid) => {
    const words = await fetchSavedWords(uid);
    setSavedWords(words);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setSession(session),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    (async () => {
      const words = await fetchSavedWords(session.user.id);
      if (!cancelled) setSavedWords(words);
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (session) getDueWords(session.user.id).then(setDueWords);
  }, [session, savedWords]);

  const handleSearch = async (word) => {
    const target = word ?? input;
    if (!target.trim()) return;
    setInput(target);
    setStatus("Looking up…");
    setResult(null);

    const data = await lookupWord(target, level);

    if (data?.notFound) {
      const cached = savedWords.find(
        (w) => w.word === target.trim().toLowerCase(),
      );
      if (cached) {
        setResult(cached);
        setStatus("offline — showing your saved copy");
      } else {
        setStatus(
          "Word not found — check spelling or try again with internet on",
        );
      }
      return;
    }

    setResult(data);
    const { error } = await saveWord(session.user.id, {
      ...data,
      difficulty: level,
    });
    setStatus(error ? `couldn't save — ${error.message}` : "found & saved");
    refreshSavedWords(session.user.id);
  };

  const handleMark = async (mark) => {
    const saved = savedWords.find((w) => w.word === result.word);
    if (saved) {
      await updateWordStatus(saved.id, mark);
      refreshSavedWords(session.user.id);
    }
  };

  const handleDelete = async (id) => {
    await deleteWord(id);
    refreshSavedWords(session.user.id);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (loadingSession)
    return <p style={{ textAlign: "center", marginTop: 80 }}>Loading…</p>;
  if (!session) return <Auth />;

  return (
    <div className="wrap">
      <header>
        <div className="title-block">
          <h1>
            Vocabulary Ledger <span className="devanagari">शब्द-पत्रिका</span>
          </h1>
          <p>Search. Save. Test yourself later.</p>
        </div>
        <div className="header-right">
          <span className="stat-pill">
            {savedWords.length} word{savedWords.length === 1 ? "" : "s"} saved
          </span>
          <UserMenu session={session} onLogout={handleLogout} />
        </div>
      </header>

      <div className="search-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Type an English word… e.g. resilient"
        />
        <button onClick={() => handleSearch()}>Search</button>
      </div>
      <div className="level-row">
        {["Beginner", "Intermediate", "Advanced"].map((l) => (
          <button
            key={l}
            className={`level-chip ${level === l ? "active" : ""}`}
            onClick={() => setLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="status-line">{status && `> ${status}`}</div>

      <div className="review-banner discover">
        <span>Learn new exam vocabulary today</span>
        <button
          className="start-review-btn"
          onClick={() => setDiscoverActive(true)}
        >
          Discover words
        </button>
      </div>

      <div className="review-banner exam">
        <span>
          Exam prep quiz — category-based, not limited to your saved words
        </span>
        <button
          className="start-review-btn"
          onClick={() => setExamQuizActive(true)}
        >
          Exam Quiz
        </button>
      </div>

      {savedWords.length > 0 && (
        <div className="review-banner practice">
          <span>Practice quiz — test yourself on any saved word, anytime</span>
          <button
            className="start-review-btn"
            onClick={() => {
              setPracticeActive(true);
              setQuizSummary(null);
            }}
          >
            Practice Quiz
          </button>
        </div>
      )}

      {dueWords.length > 0 && (
        <div className="review-banner">
          <span>
            {dueWords.length} word{dueWords.length === 1 ? "" : "s"} due for
            scheduled review today
          </span>
          <button
            className="start-review-btn"
            onClick={() => {
              setQuizActive(true);
              setQuizSummary(null);
            }}
          >
            Start Review
          </button>
        </div>
      )}
      {quizSummary && (
        <div className="review-banner done">
          Review finished — {quizSummary.remembered} remembered,{" "}
          {quizSummary.forgot} to revisit again.
        </div>
      )}

      <WordCard
        data={result}
        onMark={handleMark}
        onSearchRelated={(w) => handleSearch(w)}
        onClose={() => {
          setResult(null);
          setStatus("");
          setInput("");
        }}
      />

      <div className="section-title">
        Saved words <span className="hint">(tap to reopen, ✕ to delete)</span>
        {savedWords.length > 0 && (
          <button
            className="export-btn"
            onClick={() => exportWordsToCSV(savedWords)}
          >
            ⇩ Export CSV
          </button>
        )}
      </div>
      <SavedList
        words={savedWords}
        onOpen={(w) => handleSearch(w)}
        onDelete={handleDelete}
      />
      {quizActive && (
        <QuizMode
          wordPool={dueWords}
          userId={session.user.id}
          onRefresh={() => refreshSavedWords(session.user.id)}
          onFinish={(summary) => {
            setQuizActive(false);
            setQuizSummary(summary);
          }}
        />
      )}
      {practiceActive && (
        <QuizMode
          wordPool={savedWords}
          userId={session.user.id}
          onRefresh={() => refreshSavedWords(session.user.id)}
          onFinish={(summary) => {
            setPracticeActive(false);
            setQuizSummary(summary);
          }}
        />
      )}
      {discoverActive && (
        <DiscoverMode
          userId={session.user.id}
          level={level}
          savedWordsList={savedWords}
          onRefresh={() => refreshSavedWords(session.user.id)}
          onFinish={() => setDiscoverActive(false)}
        />
      )}

      {examQuizActive && (
        <ExamQuiz
          userId={session.user.id}
          savedWordsList={savedWords}
          onRefresh={() => refreshSavedWords(session.user.id)}
          onFinish={() => setExamQuizActive(false)}
        />
      )}
    </div>
  );
}

export default App;
