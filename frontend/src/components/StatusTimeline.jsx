import { STATUS_COLORS, STATUS_FLOW } from "../utils/api";

export default function StatusTimeline({ statusHistory, currentStatus }) {
  return (
    <div style={{ padding: "16px 0" }}>
      {STATUS_FLOW.map((step, i) => {
        const done = STATUS_FLOW.indexOf(currentStatus) >= i;
        const histEntry = statusHistory?.find(h => h.status === step);
        return (
          <div key={step} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: done ? "#F5A623" : "#e0e0e0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", color: done ? "#fff" : "#999",
                flexShrink: 0
              }}>{done ? "✓" : i + 1}</div>
              {i < STATUS_FLOW.length - 1 && (
                <div style={{ width: "2px", height: "24px", background: done ? "#F5A623" : "#e0e0e0", margin: "2px 0" }} />
              )}
            </div>
            <div style={{ paddingTop: "4px" }}>
              <div style={{ fontWeight: "600", fontSize: "13px", color: done ? "#1a1a1a" : "#999" }}>
                {STATUS_COLORS[step]?.label || step}
              </div>
              {histEntry && (
                <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
                  {new Date(histEntry.timestamp).toLocaleTimeString()} — {histEntry.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
