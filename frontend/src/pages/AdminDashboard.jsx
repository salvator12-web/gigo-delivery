import { useState, useEffect, useCallback } from "react";
import { request, STATUS_COLORS, STATUS_FLOW, formatCurrency, timeAgo } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";

const C = { orange: "#F5A623", navy: "#0D1B2A", surface: "#fff", border: "#e5e7eb", red: "#C0392B" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "", notes: "", items: [{ name: "", qty: 1, price: 0 }] });

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersData, ridersData] = await Promise.all([
      request("/orders"),
      request("/users/riders"),
    ]);
    setOrders(Array.isArray(ordersData) ? ordersData : []);
    setRiders(Array.isArray(ridersData) ? ridersData : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const assignRider = async (orderId, riderId) => {
    const data = await request(`/orders/${orderId}/assign-rider`, { method: "PATCH", body: JSON.stringify({ riderId }) });
    if (data.success) { setMsg({ type: "success", text: "Rider assigned!" }); load(); if (selectedOrder?._id === orderId) setSelectedOrder(data.order); }
    else setMsg({ type: "error", text: data.error || "Failed" });
  };

  const updateStatus = async (orderId, status) => {
    const data = await request(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (data.success) { setMsg({ type: "success", text: "Status updated!" }); load(); if (selectedOrder?._id === orderId) setSelectedOrder(data.order); }
    else setMsg({ type: "error", text: data.error || "Failed" });
  };

  const createOrder = async () => {
    const data = await request("/orders", { method: "POST", body: JSON.stringify(form) });
    if (data.success) { setMsg({ type: "success", text: `Order ${data.order.orderNumber} created!` }); setShowCreateModal(false); setForm({ customerName: "", customerPhone: "", customerAddress: "", notes: "", items: [{ name: "", qty: 1, price: 0 }] }); load(); }
    else setMsg({ type: "error", text: data.error || "Failed" });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { name: "", qty: 1, price: 0 }] });
  const updateItem = (i, field, value) => { const items = [...form.items]; items[i][field] = value; setForm({ ...form, items }); };
  const removeItem = (i) => { const items = form.items.filter((_, idx) => idx !== i); setForm({ ...form, items }); };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    active: orders.filter(o => ["accepted","picked_up","on_the_way"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>
      <Navbar title="Admin Dashboard" />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
        {msg && (
          <div onClick={() => setMsg(null)} style={{ background: msg.type === "success" ? "#D4EDDA" : "#F8D7DA", color: msg.type === "success" ? "#155724" : "#721C24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            {msg.text} <span style={{ float: "right" }}>✕</span>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Orders", value: stats.total, color: C.navy },
            { label: "Pending", value: stats.pending, color: "#856404" },
            { label: "Active", value: stats.active, color: "#004085" },
            { label: "Delivered", value: stats.delivered, color: "#155724" },
          ].map((s, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1fr 380px" : "1fr", gap: "20px" }}>
          {/* Orders List */}
          <div style={{ background: C.surface, borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["all", "pending", "accepted", "picked_up", "on_the_way", "delivered", "cancelled"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", border: `1px solid ${filter === f ? C.orange : C.border}`, background: filter === f ? C.orange : "transparent", color: filter === f ? C.navy : "#666" }}>
                    {f === "all" ? "All" : STATUS_COLORS[f]?.label || f}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowCreateModal(true)} style={{ background: C.orange, color: C.navy, border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "700" }}>
                + New Order
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>No orders found</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Order #", "Customer", "Items", "Total", "Status", "Rider", "Time", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id} onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: selectedOrder?._id === order._id ? "#FFF8ED" : "transparent" }}>
                        <td style={{ padding: "12px 16px", fontWeight: "700", color: C.orange, fontSize: "13px" }}>{order.orderNumber}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>{order.customerName}</div>
                          <div style={{ fontSize: "11px", color: "#666" }}>{order.customerPhone}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#666" }}>{order.items?.length || 0} items</td>
                        <td style={{ padding: "12px 16px", fontWeight: "600", fontSize: "13px" }}>{formatCurrency(order.totalAmount)}</td>
                        <td style={{ padding: "12px 16px" }}><StatusBadge status={order.status} /></td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#666" }}>{order.riderName || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: "11px", color: "#999" }}>{timeAgo(order.createdAt)}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {!order.rider && order.status === "pending" && (
                              <select onChange={e => e.target.value && assignRider(order._id, e.target.value)} onClick={e => e.stopPropagation()} defaultValue="" style={{ fontSize: "11px", padding: "4px 6px", borderRadius: "6px", border: `1px solid ${C.border}` }}>
                                <option value="">Assign rider</option>
                                {riders.filter(r => r.isAvailable).map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                              </select>
                            )}
                            {order.status !== "delivered" && order.status !== "cancelled" && order.rider && (
                              <select onChange={e => e.target.value && updateStatus(order._id, e.target.value)} onClick={e => e.stopPropagation()} value={order.status} style={{ fontSize: "11px", padding: "4px 6px", borderRadius: "6px", border: `1px solid ${C.border}` }}>
                                {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label || s}</option>)}
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Detail Panel */}
          {selectedOrder && (
            <div style={{ background: C.surface, borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "20px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontWeight: "700", fontSize: "15px" }}>{selectedOrder.orderNumber}</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: "18px", color: "#999" }}>✕</button>
              </div>

              <StatusBadge status={selectedOrder.status} />

              <div style={{ marginTop: "16px", fontSize: "13px" }}>
                <div style={{ marginBottom: "8px" }}><strong>Customer:</strong> {selectedOrder.customerName}</div>
                <div style={{ marginBottom: "8px" }}><strong>Phone:</strong> {selectedOrder.customerPhone}</div>
                <div style={{ marginBottom: "8px" }}><strong>Address:</strong> {selectedOrder.customerAddress}</div>
                <div style={{ marginBottom: "8px" }}><strong>Rider:</strong> {selectedOrder.riderName || "Not assigned"}</div>
                {selectedOrder.notes && <div style={{ marginBottom: "8px" }}><strong>Notes:</strong> {selectedOrder.notes}</div>}
              </div>

              <div style={{ margin: "16px 0", padding: "12px", background: "#F9FAFB", borderRadius: "8px" }}>
                <div style={{ fontWeight: "600", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", color: "#666" }}>Items</div>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span>{item.name} x{item.qty}</span>
                    <span style={{ fontWeight: "600" }}>{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                  <span>Total</span>
                  <span style={{ color: C.orange }}>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div style={{ fontWeight: "600", fontSize: "12px", textTransform: "uppercase", color: "#666", marginBottom: "4px" }}>Delivery Timeline</div>
              <StatusTimeline statusHistory={selectedOrder.statusHistory} currentStatus={selectedOrder.status} />
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }} onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div style={{ background: C.surface, borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: "700", fontSize: "16px" }}>Create New Order</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#999" }}>✕</button>
            </div>

            {[
              { label: "Customer Name", key: "customerName", type: "text", placeholder: "Full name" },
              { label: "Phone Number", key: "customerPhone", type: "text", placeholder: "+257 XX XXX XXX" },
              { label: "Delivery Address", key: "customerAddress", type: "text", placeholder: "Street, District, City" },
              { label: "Notes (optional)", key: "notes", type: "text", placeholder: "Special instructions..." },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>Items</label>
                <button onClick={addItem} style={{ background: C.orange, color: C.navy, border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: "600" }}>+ Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 30px", gap: "6px", marginBottom: "6px" }}>
                  <input placeholder="Item name" value={item.name} onChange={e => updateItem(i, "name", e.target.value)}
                    style={{ padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", outline: "none" }} />
                  <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))}
                    style={{ padding: "7px 8px", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", outline: "none" }} />
                  <input type="number" placeholder="Price" value={item.price} onChange={e => updateItem(i, "price", Number(e.target.value))}
                    style={{ padding: "7px 8px", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", outline: "none" }} />
                  <button onClick={() => removeItem(i)} style={{ background: "#F8D7DA", border: "none", borderRadius: "6px", color: C.red, fontWeight: "700", fontSize: "14px" }}>✕</button>
                </div>
              ))}
              <div style={{ textAlign: "right", fontSize: "13px", fontWeight: "700", color: C.orange, marginTop: "8px" }}>
                Total: {formatCurrency(form.items.reduce((s, i) => s + (i.price * i.qty), 0))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: "8px", background: "transparent", fontSize: "13px" }}>Cancel</button>
              <button onClick={createOrder} style={{ padding: "10px 20px", background: C.orange, color: C.navy, border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
