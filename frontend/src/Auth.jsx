import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setMessage(
        error ? error.message : "Check your email to confirm your account.",
      );
    } else if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setMessage(error ? error.message : "Reset link sent — check your email.");
    }
    setLoading(false);
  };

  const titles = {
    signup: "Create your jar",
    login: "Welcome back",
    forgot: "Reset password",
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <h1 className="auth-logo">
          WordJar <span className="devanagari">शब्द-पत्रिका</span>
        </h1>
        <p className="auth-tagline">Every word you meet, kept for later.</p>

        <div className="auth-feature">
          <div className="auth-feature-icon">📚</div>
          <div>
            <div className="auth-feature-title">
              Catch words from everywhere
            </div>
            <div className="auth-feature-text">
              A book, a web series, a movie, a game, a conversation, an exam —
              the moment a word catches your attention, drop it in your jar.
            </div>
          </div>
        </div>

        <div className="auth-feature">
          <div className="auth-feature-icon">🔖</div>
          <div>
            <div className="auth-feature-title">Auto-saved, always yours</div>
            <div className="auth-feature-text">
              Every word you search is saved automatically — Hindi meaning,
              English explanation, pronunciation, synonyms, antonyms — building
              a personal dictionary that's actually yours, not a generic list.
            </div>
          </div>
        </div>

        <div className="auth-feature">
          <div className="auth-feature-icon">🧠</div>
          <div>
            <div className="auth-feature-title">
              Test yourself, not just store
            </div>
            <div className="auth-feature-text">
              Words you forget resurface sooner. Words you know drift further
              out. Quizzes pull from your own jar — and from exam word banks —
              so it never goes stale.
            </div>
          </div>
        </div>

        <div className="auth-feature">
          <div className="auth-feature-icon">🌱</div>
          <div>
            <div className="auth-feature-title">Grows with you, forever</div>
            <div className="auth-feature-text">
              No fixed word list to finish. New words keep arriving from daily
              life, one small habit at a time.
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2 className="auth-form-title">{titles[mode]}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading
                ? "Please wait…"
                : mode === "signup"
                  ? "Sign up"
                  : mode === "login"
                    ? "Log in"
                    : "Send reset link"}
            </button>
          </form>

          <div className="auth-links">
            {mode !== "login" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Already have an account? Log in
              </button>
            )}
            {mode !== "signup" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
              >
                Don't have an account? Sign up
              </button>
            )}
            {mode !== "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setMessage("");
                }}
              >
                Forgot your password?
              </button>
            )}
          </div>

          {message && <p className="auth-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
