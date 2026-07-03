import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("signup"); // 'signup' | 'login' | 'forgot'
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
        error
          ? error.message
          : "Check your email to confirm your account (or check Supabase Auth settings if you disabled confirmation).",
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
      setMessage(
        error
          ? error.message
          : "Reset link sent — check your email and click the link to set a new password.",
      );
    }
    setLoading(false);
  };

  const titles = {
    signup: "Create account",
    login: "Log in",
    forgot: "Reset password",
  };

  return (
    <div
      style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}
    >
      <h2>{titles[mode]}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
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
        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "signup"
              ? "Sign up"
              : mode === "login"
                ? "Log in"
                : "Send reset link"}
        </button>
      </form>

      <div
        style={{
          fontSize: 13,
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {mode !== "login" && (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            style={linkStyle}
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
            style={linkStyle}
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
            style={linkStyle}
          >
            Forgot your password?
          </button>
        )}
      </div>

      {message && (
        <p style={{ fontSize: 13, color: "#a5372b", marginTop: 10 }}>
          {message}
        </p>
      )}
    </div>
  );
}

const linkStyle = {
  background: "none",
  border: "none",
  color: "blue",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
  fontSize: 13,
};
