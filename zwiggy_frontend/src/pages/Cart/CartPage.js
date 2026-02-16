import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, EmptyState, Input } from "../../components/ui";
import { useCart } from "../../state/CartContext";
import "../pages.css";

export default function CartPage() {
  const cart = useCart();
  const nav = useNavigate();

  const [address, setAddress] = useState("221B Baker Street");
  const [note, setNote] = useState("");

  const canCheckout = cart.items.length > 0 && Boolean(address.trim());

  const summary = useMemo(() => cart.totals, [cart.totals]);

  if (cart.items.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="Your cart is empty"
          description="Browse restaurants and add items to start an order."
          action={
            <Button as="link" to="/restaurants" variant="primary">
              Browse restaurants
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header row-between">
        <div>
          <h1 className="h1">Your cart</h1>
          <p className="p">
            {cart.restaurant ? (
              <>
                Ordering from <strong>{cart.restaurant.name}</strong>
              </>
            ) : (
              "Review items before checkout."
            )}
          </p>
        </div>
        <div className="header-actions">
          <Button variant="ghost" onClick={cart.clearCart}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid two">
        <Card className="panel">
          <div className="section-title">Items</div>
          <div className="cart-list">
            {cart.items.map((it) => (
              <div key={it.id} className="cart-item">
                <div className="cart-item-main">
                  <div className="cart-item-name">{it.name}</div>
                  <div className="cart-item-sub">${Number(it.price).toFixed(2)} each</div>
                </div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => cart.setQuantity(it.id, it.quantity - 1)} aria-label="Decrease">−</button>
                  <div className="qty">{it.quantity}</div>
                  <button className="qty-btn" onClick={() => cart.setQuantity(it.id, it.quantity + 1)} aria-label="Increase">+</button>
                  <button className="remove-btn" onClick={() => cart.removeItem(it.id)} aria-label="Remove">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel">
          <div className="section-title">Checkout</div>
          <div className="form">
            <Input label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input label="Note to restaurant (optional)" value={note} onChange={(e) => setNote(e.target.value)} />

            <div className="summary">
              <div className="sum-row"><span>Subtotal</span><span>${summary.subtotal.toFixed(2)}</span></div>
              <div className="sum-row"><span>Delivery</span><span>${summary.deliveryFee.toFixed(2)}</span></div>
              <div className="sum-row"><span>Tax</span><span>${summary.tax.toFixed(2)}</span></div>
              <div className="sum-row total"><span>Total</span><span>${summary.total.toFixed(2)}</span></div>
            </div>

            <div className="actions">
              <Button
                variant="primary"
                size="lg"
                disabled={!canCheckout}
                onClick={() => nav("/checkout", { state: { address, note } })}
              >
                Proceed to payment
              </Button>
              <Button as="link" to="/restaurants" variant="ghost" size="lg">
                Add more items
              </Button>
            </div>

            <div className="fineprint">
              By placing an order you agree to Zwiggy’s{" "}
              <Link to="/restaurants">terms</Link>.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
