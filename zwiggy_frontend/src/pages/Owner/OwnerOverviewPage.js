import React, { useEffect, useState } from "react";
import { Badge, Card, EmptyState } from "../../components/ui";
import "../pages.css";

export default function OwnerOverviewPage({ api }) {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [rs, os] = await Promise.all([api.ownerGetRestaurants(), api.ownerGetOrders()]);
        if (mounted) {
          setRestaurants(rs || []);
          setOrders(os || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  if (loading) return <div className="page"><EmptyState title="Loading dashboard…" /></div>;

  const openOrders = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="h1">Owner dashboard</h1>
        <p className="p">Manage orders and keep operations running smoothly.</p>
      </div>

      <div className="grid three">
        <Card className="panel stat">
          <div className="stat-label">Restaurants</div>
          <div className="stat-value">{restaurants.length}</div>
          <Badge variant="primary">Active</Badge>
        </Card>

        <Card className="panel stat">
          <div className="stat-label">Total orders</div>
          <div className="stat-value">{orders.length}</div>
          <Badge variant="default">All time</Badge>
        </Card>

        <Card className="panel stat">
          <div className="stat-label">Open orders</div>
          <div className="stat-value">{openOrders}</div>
          <Badge variant="success">In progress</Badge>
        </Card>
      </div>
    </div>
  );
}
