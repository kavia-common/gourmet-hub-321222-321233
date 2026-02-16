import React, { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, EmptyState, Select } from "../../components/ui";
import { useCart } from "../../state/CartContext";
import "../pages.css";

export default function CheckoutPage({ api }) {
  const cart = useCart();
  const nav = useNavigate();
  const location = useLocation();

  const address = location.state?.address || "";
  const note = location.state?.note || "";

  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const totals = useMemo(() => cart.totals, [cart.totals]);

  if (cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  if (!cart.restaurant) {
    return (
      <div className="page">
        <EmptyState title="Missing restaurant" description="Please go back and re-add items." />
      </div>
    );
  }

  async function place() {
    setBusy(true);
    setErr(null);
    try {
      // Backend OpenAPI: POST /orders expects { delivery_address }
      const payload = { delivery_address: address };
      const order = await api.placeOrder(payload);
      cart.clearCart();
      nav(`/orders/${order.id}`, { replace: true });
    } catch (e) {
      setErr(e.message || "Failed to place order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="h1">Checkout</h1>
        <p className="p">Confirm payment and place your order.</p>
      </div>

      <div className="grid two">
        <Card className="panel">
          <div className="section-title">Payment</div>
          <div className="form">
            <Select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="COD">Cash on delivery</option>
            </Select>
            <div className="fineprint">
              Secure payments with modern encryption (mock in demo).
            </div>
          </div>
        </Card>

        <Card className="panel">
          <div className="section-title">Order summary</div>
          <div className="summary">
            <div className="sum-row"><span>Restaurant</span><span>{cart.restaurant.name}</span></div>
            <div className="sum-row"><span>Items</span><span>{cart.items.length}</span></div>
            <div className="sum-row"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
            <div className="sum-row"><span>Delivery</span><span>${totals.deliveryFee.toFixed(2)}</span></div>
            <div className="sum-row"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
            <div className="sum-row total"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
          </div>

          {err ? <div className="error-banner">{err}</div> : null}

          <div className="actions">
            <Button variant="primary" size="lg" disabled={busy} onClick={place}>
              {busy ? "Placing order…" : "Place order"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => nav("/cart")}>
              Back to cart
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
