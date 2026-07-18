import { useNavigate } from "react-router-dom";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", background: "#0D1B2A", color: "#fff" }}>
      <div style={{ fontSize: "64px" }}>🚚</div>
      <h1 style={{ fontSize: "24px", fontWeight: "800" }}>Page Not Found</h1>
      <p style={{ color: "rgba(255,255,255,0.5)" }}>This delivery went to the wrong address!</p>
      <button onClick={() => navigate("/")} style={{ background: "#F5A623", color: "#0D1B2A", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "700" }}>Go Home</button>
    </div>
  );
}
