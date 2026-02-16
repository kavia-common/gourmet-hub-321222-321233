import React, { useEffect, useState } from "react";
import { Badge, Card, EmptyState } from "../../components/ui";
import "../pages.css";

export default function OwnerRestaurantsPage({ api }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api.ownerGetRestaurants();
        if (mounted) setRestaurants(data || []);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load restaurants");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  if (loading) return <div className="page"><EmptyState title="Loading restaurants…" /></div>;
  if (err) return <div className="page"><EmptyState title="Could not load restaurants" description={err} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="h1">Your restaurants</h1>
        <p className="p">Manage listings (edit/create endpoints can be added on backend).</p>
      </div>

      <div className="grid">
        {restaurants.map((r) => (
          <Card key={r.id} className="panel">
            <div className="restaurant-hero">
              <div className="restaurant-icon">{r.name.slice(0, 1).toUpperCase()}</div>
              <div className="restaurant-meta">
                <div className="restaurant-name">{r.name}</div>
                <div className="restaurant-sub">{(r.cuisine || []).join(" • ")}</div>
              </div>
            </div>
            <div className="restaurant-stats">
              <Badge variant="success">★ {r.rating}</Badge>
              <Badge variant="default">{r.etaMins} min</Badge>
              <Badge variant="default">{r.address}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
