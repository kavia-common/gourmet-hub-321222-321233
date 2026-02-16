import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Input, Badge, EmptyState, Button } from "../../components/ui";
import "../pages.css";

export default function RestaurantListPage({ api }) {
  const [restaurants, setRestaurants] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api.listRestaurants();
        if (mounted) setRestaurants(data || []);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load restaurants");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return restaurants;
    return restaurants.filter((r) => {
      const hay = `${r.name} ${(r.cuisine || []).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [restaurants, q]);

  return (
    <div className="page">
      <div className="page-header row-between">
        <div>
          <h1 className="h1">Restaurants</h1>
          <p className="p">Discover your next favorite meal.</p>
        </div>
        <div className="header-actions">
          <Button as="link" to="/orders" variant="ghost">
            Track orders
          </Button>
        </div>
      </div>

      <div className="toolbar">
        <Input
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or cuisine…"
        />
      </div>

      {loading ? (
        <EmptyState title="Loading restaurants…" />
      ) : err ? (
        <EmptyState title="Could not load restaurants" description={err} action={<Button onClick={() => window.location.reload()}>Reload</Button>} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No results" description="Try a different search term." />
      ) : (
        <div className="grid">
          {filtered.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="card-link">
              <Card className="restaurant-card">
                <div className="restaurant-hero">
                  <div className="restaurant-icon">{r.name.slice(0, 1).toUpperCase()}</div>
                  <div className="restaurant-meta">
                    <div className="restaurant-name">{r.name}</div>
                    <div className="restaurant-sub">
                      <span>{(r.cuisine || []).join(" • ")}</span>
                    </div>
                  </div>
                </div>
                <div className="restaurant-stats">
                  <Badge variant="success">★ {r.rating}</Badge>
                  <Badge variant="default">{r.etaMins} min</Badge>
                  <Badge variant="default">${Number(r.deliveryFee || 0).toFixed(2)} fee</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
