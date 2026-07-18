import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const C = { orange: "#F5A623", navy: "#0D1B2A" };

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@gigo.com", password: "admin123" },
  { label: "Rider 1", email: "rider1@gigo.com", password: "rider123" },
  { label: "Rider 2", email: "rider2@gigo.com", password: "rider123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "rider") navigate("/rider");
      else navigate("/track");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => { setEmail(acc.email); setPassword(acc.password); };

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", background: C.orange, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "900", color: C.navy, margin: "0 auto 16px" }}>G</div>
          <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "800" }}>GIGO Delivery</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "4px" }}>Smart Delivery Tracking System</p>
        </div>

        <div style={{ background: "#1E2D3D", borderRadius: "16px", padding: "28px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                style={{ width: "100%", background: C.navy, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: "100%", background: C.navy, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {error && <div style={{ background: "rgba(192,57,43,0.15)", border: "1px solid #C0392B", borderRadius: "8px", padding: "10px", fontSize: "12px", color: "#E74C3C", marginBottom: "14px" }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", background: C.orange, color: C.navy, border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: "700" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Demo Accounts</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.label} onClick={() => fillDemo(acc)} style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", color: C.orange, padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" }}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          Track your order? <a href="/track" style={{ color: C.orange }}>Click here</a>
        </p>
      </div>
    </div>
  );
}
