import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState } from "../../components/ui";
import "../pages.css";

function statusVariant(status) {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "OUT_FOR_DELIVERY") return "primary";
  return "default";
}

export default function OrderTrackingPage({ api }) {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await api.getOrder(orderId);
        if (mounted) setOrder(data);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const t = setInterval(load, 4000); // simulate polling
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [api, orderId]);

  const timeline = useMemo(() => order?.statusTimeline || [], [order]);

  if (loading) return <div className="page"><EmptyState title="Loading order…" /></div>;
  if (err) return <div className="page"><EmptyState title="Could not load order" description={err} /></div>;
  if (!order) return <div className="page"><EmptyState title="Order not found" /></div>;

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link to="/orders">Orders</Link> <span className="crumb-sep">/</span> <span>{order.id}</span>
      </div>

      <div className="page-header row-between">
        <div>
          <h1 className="h1">Order tracking</h1>
          <p className="p">Live updates via polling (WebSocket ready via REACT_APP_WS_URL).</p>
        </div>
        <div className="header-actions">
          <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
        </div>
      </div>

      <div className="grid two">
        <Card className="panel">
          <div className="section-title">Items</div>
          <div className="stack">
            {(order.items || []).map((it) => (
              <div key={it.id} className="line-row">
                <div className="line-main">
                  <div className="line-name">{it.name}</div>
                  <div className="line-sub">{it.quantity} × ${Number(it.price).toFixed(2)}</div>
                </div>
                <div className="line-right">
                  ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="summary">
            <div className="sum-row"><span>Total</span><span>${Number(order.totals?.total || 0).toFixed(2)}</span></div>
          </div>
        </Card>

        <Card className="panel">
          <div className="section-title">Status timeline</div>
          <div className="timeline">
            {timeline.map((t, idx) => (
              <div key={`${t.status}_${idx}`} className="timeline-row">
                <div className="timeline-dot" />
                <div className="timeline-main">
                  <div className="timeline-title">
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                    <span className="timeline-time">{new Date(t.at).toLocaleTimeString()}</span>
                  </div>
                  <div className="timeline-note">{t.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="actions">
            <Button as="link" to="/restaurants" variant="ghost">
              Order again
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
