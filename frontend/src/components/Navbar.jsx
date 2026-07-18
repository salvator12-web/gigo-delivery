import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const C = { orange: "#F5A623", navy: "#0D1B2A" };

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav style={{
      background: C.navy, color: "#fff",
      padding: "0 24px", height: "56px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          background: C.orange, color: C.navy,
          width: "32px", height: "32px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "900", fontSize: "16px"
        }}>G</div>
        <span style={{ fontWeight: "700", fontSize: "15px" }}>GIGO Delivery</span>
        {title && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>/ {title}</span>}
      </div>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            {user.name} <span style={{ color: C.orange, fontSize: "11px" }}>({user.role})</span>
          </span>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", padding: "6px 14px", borderRadius: "6px", fontSize: "12px"
          }}>Logout</button>
        </div>
      )}
    </nav>
  );
}
