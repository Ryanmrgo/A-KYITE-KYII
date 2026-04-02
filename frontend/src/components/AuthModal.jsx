import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const S = {
  bg: "#131313",
  surface: "#1a1a1a",
  surfaceHigh: "#222",
  border: "#2a2a2a",
  text: "#e5e2e1",
  muted: "#9ca3af",
  red: "#e50914",
  redDim: "rgba(229,9,20,0.15)",
};

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div 
        style={{
          width: "100%", maxWidth: "420px", padding: "3rem 2.5rem",
          background: "linear-gradient(135deg, rgba(30,30,30,0.6) 0%, rgba(10,10,10,0.8) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderLeft: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: "1rem", right: "1rem",
          background: "none", border: "none", color: S.muted,
          fontSize: "1.5rem", cursor: "pointer",
        }}>×</button>

        <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.5rem", fontWeight: 800, color: S.text }}>
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        {error && (
          <div style={{
            padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px",
            backgroundColor: "#2a1515", border: "1px solid #7f1d1d",
            color: "#fca5a5", fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {!isLogin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: S.muted, fontWeight: 600 }}>Your Name</label>
              <input 
                type="text" required placeholder="John Doe"
                value={name} onChange={e => setName(e.target.value)}
                style={{
                  padding: "0.9rem", borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.06)", 
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", outline: "none", fontSize: "0.95rem",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = S.red; e.target.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", color: S.muted, fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" required placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{
                padding: "0.9rem", borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.06)", 
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", outline: "none", fontSize: "0.95rem",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = S.red; e.target.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", color: S.muted, fontWeight: 600 }}>Password</label>
            <input 
              type="password" required minLength={6} placeholder="Enter at least 6 characters"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{
                padding: "0.9rem", borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.06)", 
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", outline: "none", fontSize: "0.95rem",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = S.red; e.target.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="glass-btn"
            style={{
              marginTop: "1rem", padding: "0.9rem", borderRadius: "9999px",
              color: "#fff", border: "none",
              fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "all 0.3s ease",
            }}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: S.muted }}>
          {isLogin ? "New to Cinema?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: "none", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            {isLogin ? "Sign up now." : "Sign in here."}
          </button>
        </div>
      </div>
    </div>
  );
}
