const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const request = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  return res.json();
};

export const STATUS_COLORS = {
  pending:    { bg: "#FFF3CD", color: "#856404", label: "Pending" },
  accepted:   { bg: "#D1ECF1", color: "#0C5460", label: "Accepted" },
  picked_up:  { bg: "#CCE5FF", color: "#004085", label: "Picked Up" },
  on_the_way: { bg: "#D4EDDA", color: "#155724", label: "On the Way 🛵" },
  delivered:  { bg: "#C3E6CB", color: "#155724", label: "Delivered ✅" },
  cancelled:  { bg: "#F8D7DA", color: "#721C24", label: "Cancelled" },
};

export const STATUS_FLOW = ["pending", "accepted", "picked_up", "on_the_way", "delivered"];
export const formatCurrency = (n) => `FBu ${new Intl.NumberFormat("fr-BI").format(n || 0)}`;
export const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
