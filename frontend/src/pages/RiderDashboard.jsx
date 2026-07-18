import { useState, useEffect, useCallback } from "react";
import { request, STATUS_COLORS, STATUS_FLOW, formatCurrency, timeAgo } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";

const C = { orange: "#F5A623", navy: "#0D1B2A", border: "#e5e7eb" };

const RIDER_ACTIONS = {
  accepted:   { next: "picked_up",  label: "Mark as Picked Up 📦" },
  picked_up:  { next: "on_the_way", label: "I'm On the Way 🛵" },
  on_the_way: { next: "delivered",  label: "Mark as Delivered ✅" },
};

export default function RiderDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const data = await request(`/riders/${user._id}/orders`);
    setOrders(Array.isArray(data) ? data.filter(o => o.status !== "delivered" && o.status !== "cancelled") : []);
    setLoading(false);
  }, [user._id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const updateStatus = async (orderId, status) => {
    const data = await request(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (data.success) {
      setMsg({ type: "success", text: `Status updated to ${STATUS_COLORS[status]?.label}!` });
      load();
      if (selectedOrder?._id === orderId) setSelectedOrder(data.order);
    } else setMsg({ type: "error", text: data.error || "Failed" });
  };

  const activeOrders = orders.filter(o => o.status !== "pending");
  const completedToday = orders.filter(o => o.status === "delivered").length;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>
      <Navbar title="Rider Dashboard" />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
        {msg && (
          <div onClick={() => setMsg(null)} style={{ background: msg.type === "success" ? "#D4EDDA" : "#F8D7DA", color: msg.type === "success" ? "#155724" : "#721C24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            {msg.text} <span style={{ float: "right" }}>✕</span>
          </div>
        )}

        {/* Rider Info */}
        <div style={{ background: C.navy, borderRadius: "12px", padding: "20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "800", color: C.navy }}>
              {user.name[0]}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: "700", fontSize: "16px" }}>{user.name}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>🛵 Delivery Rider</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.orange, fontWeight: "800", fontSize: "24px" }}>{activeOrders.length}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Active Orders</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading your deliveries...</div>
        ) : orders.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛵</div>
            <div style={{ fontWeight: "600", color: "#333" }}>No active deliveries</div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>You'll see orders here once assigned</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {orders.map(order => {
              const action = RIDER_ACTIONS[order.status];
              return (
                <div key={order._id} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "700", color: C.orange, fontSize: "15px" }}>{order.orderNumber}</span>
                      <span style={{ marginLeft: "12px" }}><StatusBadge status={order.status} /></span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#999" }}>{timeAgo(order.createdAt)}</span>
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", marginBottom: "3px" }}>Customer</div>
                        <div style={{ fontWeight: "600", fontSize: "14px" }}>{order.customerName}</div>
                        <div style={{ fontSize: "13px", color: C.orange }}>{order.customerPhone}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", marginBottom: "3px" }}>Delivery Address</div>
                        <div style={{ fontSize: "13px", fontWeight: "500" }}>{order.customerAddress}</div>
                      </div>
                    </div>

                    <div style={{ background: "#F9FAFB", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
                      <div style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", marginBottom: "6px" }}>Items</div>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ fontSize: "13px", display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span>{item.name} x{item.qty}</span>
                          <span style={{ fontWeight: "600" }}>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                        <span>Total to collect</span>
                        <span style={{ color: C.orange }}>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div style={{ background: "#FFF8ED", border: "1px solid #F5A623", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "13px" }}>
                        📝 {order.notes}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "9px 14px", fontSize: "12px", fontWeight: "600", color: "#555" }}>
                        {selectedOrder?._id === order._id ? "Hide Timeline" : "View Timeline"}
                      </button>
                      {action && (
                        <button onClick={() => updateStatus(order._id, action.next)} style={{ background: C.orange, color: C.navy, border: "none", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "700", flex: 1 }}>
                          {action.label}
                        </button>
                      )}
                      {order.status === "delivered" && (
                        <div style={{ color: "#155724", fontWeight: "700", fontSize: "14px" }}>✅ Delivered!</div>
                      )}
                    </div>

                    {selectedOrder?._id === order._id && (
                      <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.border}` }}>
                        <StatusTimeline statusHistory={order.statusHistory} currentStatus={order.status} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
