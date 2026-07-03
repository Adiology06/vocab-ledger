import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else
        setMessage(
          "Check your email to confirm your account (or check Supabase Auth settings if you disabled confirmation).",
        );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
      // on success, App.jsx's session listener handles the redirect automatically
    }
    setLoading(false);
  };

  return (
    <div
      style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}
    >
      <h2>{isSignUp ? "Create account" : "Log in"}</h2>
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Please wait…" : isSignUp ? "Sign up" : "Log in"}
        </button>
      </form>

      <p style={{ fontSize: 13, marginTop: 10 }}>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {isSignUp ? "Log in" : "Sign up"}
        </button>
      </p>

      {message && <p style={{ fontSize: 13, color: "#a5372b" }}>{message}</p>}
    </div>
  );
}
