import { STATUS_COLORS } from "../utils/api";

export default function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#eee", color: "#666", label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 12px", borderRadius: "20px",
      fontSize: "12px", fontWeight: "600",
      display: "inline-block", whiteSpace: "nowrap"
    }}>
      {s.label}
    </span>
  );
}
