import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState } from "../../components/ui";
import "../pages.css";

function statusVariant(status) {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "OUT_FOR_DELIVERY") return "primary";
  return "default";
}

export default function OrdersListPage({ api }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api.listMyOrders();
        if (mounted) setOrders(data || []);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  if (loading) return <div className="page"><EmptyState title="Loading orders…" /></div>;

  if (err) {
    return (
      <div className="page">
        <EmptyState title="Could not load orders" description={err} action={<Button onClick={() => window.location.reload()}>Reload</Button>} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No orders yet"
          description="Place your first order to see tracking here."
          action={<Button as="link" to="/restaurants" variant="primary">Browse restaurants</Button>}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header row-between">
        <div>
          <h1 className="h1">Your orders</h1>
          <p className="p">Track status in real time (mock timeline in demo).</p>
        </div>
        <Button as="link" to="/restaurants" variant="ghost">Browse</Button>
      </div>

      <div className="stack">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="card-link">
            <Card className="panel order-row">
              <div>
                <div className="order-id">Order {o.id}</div>
                <div className="order-sub">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="order-right">
                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                <div className="order-total">${Number(o.totals?.total || 0).toFixed(2)}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
