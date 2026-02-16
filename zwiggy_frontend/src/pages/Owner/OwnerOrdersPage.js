import React, { useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, Select } from "../../components/ui";
import "../pages.css";

function statusVariant(status) {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "OUT_FOR_DELIVERY") return "primary";
  return "default";
}

const statuses = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function OwnerOrdersPage({ api }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await api.ownerGetOrders();
      setOrders(data || []);
    } catch (e) {
      setErr(e.message || "Failed to load owner orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  async function update(orderId, status) {
    setBusyId(orderId);
    try {
      await api.ownerUpdateOrderStatus(orderId, status);
      await load();
    } catch (e) {
      setErr(e.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="page"><EmptyState title="Loading owner orders…" /></div>;

  if (err) {
    return (
      <div className="page">
        <EmptyState title="Could not load owner orders" description={err} action={<Button onClick={load}>Retry</Button>} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header row-between">
        <div>
          <h1 className="h1">Orders</h1>
          <p className="p">Update statuses to keep customers informed.</p>
        </div>
        <Button variant="ghost" onClick={load}>Refresh</Button>
      </div>

      <div className="stack">
        {orders.map((o) => (
          <Card key={o.id} className="panel owner-order">
            <div className="owner-order-top">
              <div>
                <div className="order-id">Order {o.id}</div>
                <div className="order-sub">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="owner-order-right">
                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                <div className="order-total">${Number(o.totals?.total || 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="divider" />

            <div className="owner-order-bottom">
              <div className="owner-items">
                {(o.items || []).slice(0, 4).map((it) => (
                  <div key={it.id} className="mini-line">
                    <span className="mini-name">{it.name}</span>
                    <span className="mini-qty">×{it.quantity}</span>
                  </div>
                ))}
                {(o.items || []).length > 4 ? <div className="mini-more">+ more…</div> : null}
              </div>

              <div className="owner-actions">
                <Select
                  label="Update status"
                  value={o.status}
                  onChange={(e) => update(o.id, e.target.value)}
                  disabled={busyId === o.id}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
