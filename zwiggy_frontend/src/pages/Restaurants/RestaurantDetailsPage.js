import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState } from "../../components/ui";
import { useCart } from "../../state/CartContext";
import "../pages.css";

export default function RestaurantDetailsPage({ api }) {
  const { id } = useParams();
  const cart = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await api.getRestaurant(id);
        const m = await api.listMenuItems(id);
        if (mounted) {
          setRestaurant(r);
          setMenu(m || []);
          cart.startCartForRestaurant({ id: r.id, name: r.name });
        }
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load restaurant");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, id]); // intentionally not depending on cart to avoid effect loops

  const cartTotal = useMemo(() => cart.totals.total, [cart.totals.total]);

  if (loading) return <div className="page"><EmptyState title="Loading menu…" /></div>;
  if (err) return <div className="page"><EmptyState title="Could not load restaurant" description={err} /></div>;
  if (!restaurant) return <div className="page"><EmptyState title="Restaurant not found" /></div>;

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link to="/restaurants">Restaurants</Link> <span className="crumb-sep">/</span> <span>{restaurant.name}</span>
      </div>

      <Card className="panel restaurant-header">
        <div className="restaurant-icon lg">{restaurant.name.slice(0, 1).toUpperCase()}</div>
        <div className="restaurant-meta">
          <h1 className="h1">{restaurant.name}</h1>
          <div className="restaurant-sub">
            {(restaurant.cuisine || []).join(" • ")} • {restaurant.address}
          </div>
          <div className="restaurant-stats">
            <Badge variant="success">★ {restaurant.rating}</Badge>
            <Badge variant="default">{restaurant.etaMins} min</Badge>
            <Badge variant="default">${Number(restaurant.deliveryFee || 0).toFixed(2)} fee</Badge>
          </div>
        </div>
        <div className="restaurant-cta">
          <Button as="link" to="/cart" variant="primary" size="lg">
            View cart (${cartTotal.toFixed(2)})
          </Button>
        </div>
      </Card>

      <div className="grid two">
        {menu.map((item) => (
          <Card key={item.id} className="menu-card">
            <div className="menu-title-row">
              <div className="menu-name">{item.name}</div>
              {item.veg ? <Badge variant="success">Veg</Badge> : <Badge variant="default">Non-veg</Badge>}
            </div>
            <div className="menu-desc">{item.description}</div>
            <div className="menu-bottom">
              <div className="menu-price">${Number(item.price).toFixed(2)}</div>
              <Button
                variant="secondary"
                onClick={() => cart.addItem(item, { id: restaurant.id, name: restaurant.name })}
              >
                Add
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
