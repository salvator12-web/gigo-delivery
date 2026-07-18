import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request, STATUS_COLORS, formatCurrency } from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";

const C = { orange: "#F5A623", navy: "#0D1B2A" };

export default function TrackOrder() {
  const { orderNumber: paramOrderNumber } = useParams();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState(paramOrderNumber || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async (num) => {
    const n = num || orderNumber;
    if (!n) return;
    setLoading(true); setError("");
    const data = await request(`/orders/track/${n.toUpperCase()}`);
    if (data.error) { setError("Order not found. Check your order number."); setOrder(null); }
    else setOrder(data);
    setLoading(false);
  };

  useEffect(() => { if (paramOrderNumber) track(paramOrderNumber); }, [paramOrderNumber]);

  // Auto refresh every 15s if order is active
  useEffect(() => {
    if (!order || order.status === "delivered" || order.status === "cancelled") return;
    const interval = setInterval(() => track(order.orderNumber), 15000);
    return () => clearInterval(interval);
  }, [order]);

  return (
    <div style={{ minHeight: "100vh", background: C.navy }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", background: C.orange, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: C.navy }}>G</div>
        <span style={{ color: "#fff", fontWeight: "700", fontSize: "16px" }}>GIGO Delivery</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>/ Track Order</span>
        <button onClick={() => navigate("/login")} style={{ marginLeft: "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", padding: "6px 14px", borderRadius: "6px", fontSize: "12px" }}>Login</button>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 16px" }}>
        {/* Search Box */}
        <div style={{ background: "#1E2D3D", borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
          <h2 style={{ color: "#fff", fontWeight: "700", fontSize: "18px", marginBottom: "6px" }}>Track Your Order</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "20px" }}>Enter your order number to see live delivery status</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === "Enter" && track()}
              placeholder="e.g. GD-0001"
              style={{ flex: 1, background: C.navy, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "14px", outline: "none", letterSpacing: "0.05em" }}
            />
            <button onClick={() => track()} disabled={loading} style={{ background: C.orange, color: C.navy, border: "none", borderRadius: "8px", padding: "11px 20px", fontWeight: "700", fontSize: "14px" }}>
              {loading ? "..." : "Track"}
            </button>
          </div>
          {error && <p style={{ color: "#E74C3C", fontSize: "13px", marginTop: "10px" }}>{error}</p>}
        </div>

        {/* Order Result */}
        {order && (
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
            {/* Status Banner */}
            <div style={{ background: STATUS_COLORS[order.status]?.bg || "#eee", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "800", fontSize: "20px", color: STATUS_COLORS[order.status]?.color }}>{STATUS_COLORS[order.status]?.label}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{order.orderNumber}</div>
              </div>
              {(order.status !== "delivered" && order.status !== "cancelled") && (
                <div style={{ fontSize: "11px", color: "#999", textAlign: "right" }}>
                  <div>🔄 Auto-refreshing</div>
                  <div>every 15s</div>
                </div>
              )}
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Customer Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", marginBottom: "3px" }}>Customer</div>
                  <div style={{ fontWeight: "600" }}>{order.customerName}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{order.customerPhone}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", marginBottom: "3px" }}>Address</div>
                  <div style={{ fontSize: "13px" }}>{order.customerAddress}</div>
                </div>
              </div>

              {order.riderName && (
                <div style={{ background: "#F0FFF4", border: "1px solid #C3E6CB", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>🛵</span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>Your Rider: {order.riderName}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>On the way to you!</div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div style={{ background: "#F9FAFB", borderRadius: "8px", padding: "14px", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", marginBottom: "8px" }}>Your Order</div>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span>{item.name} x{item.qty}</span>
                    <span style={{ fontWeight: "600" }}>{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                  <span>Total</span>
                  <span style={{ color: C.orange }}>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>Delivery Progress</div>
              <StatusTimeline statusHistory={order.statusHistory} currentStatus={order.status} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
