import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";
import { Button, Badge } from "./ui";
import "./layout.css";

function Logo() {
  return (
    <Link to="/restaurants" className="logo">
      <span className="logo-mark">Z</span>
      <span className="logo-text">Zwiggy</span>
    </Link>
  );
}

// PUBLIC_INTERFACE
export function Layout({ children }) {
  const auth = useAuth();
  const cart = useCart();
  const location = useLocation();

  const isOwnerArea = location.pathname.startsWith("/owner");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <Logo />
          <div className="topbar-pill">
            <span className="pill-dot" />
            <span className="pill-text">Fast delivery • Modern UI</span>
          </div>
        </div>

        <div className="topbar-right">
          <Link to="/cart" className="cart-link" aria-label="Cart">
            Cart{" "}
            {cart.itemCount > 0 ? <Badge variant="primary">{cart.itemCount}</Badge> : null}
          </Link>

          {auth.isAuthed ? (
            <div className="user-menu">
              <div className="user-chip" title={auth.user.email}>
                <span className="user-name">{auth.user.name}</span>
                <Badge variant={auth.user.role === "owner" ? "success" : "default"}>
                  {auth.user.role}
                </Badge>
              </div>
              {auth.user.role === "owner" ? (
                <Button as="link" to="/owner" variant="secondary">
                  Owner Dashboard
                </Button>
              ) : (
                <Button as="link" to="/orders" variant="secondary">
                  Orders
                </Button>
              )}
              <Button variant="ghost" onClick={auth.logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="user-menu">
              <Button as="link" to="/login" variant="primary">
                Login
              </Button>
              <Button as="link" to="/register" variant="ghost">
                Sign up
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="content">
        {isOwnerArea ? (
          <aside className="sidebar">
            <div className="sidebar-title">Owner</div>
            <nav className="sidebar-nav">
              <NavLink to="/owner" end className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
                Overview
              </NavLink>
              <NavLink to="/owner/orders" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
                Orders
              </NavLink>
              <NavLink to="/owner/restaurants" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
                Restaurants
              </NavLink>
            </nav>
          </aside>
        ) : null}

        <main className={isOwnerArea ? "main with-sidebar" : "main"}>{children}</main>
      </div>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Zwiggy</span>
        <span className="footer-sep">•</span>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          Support
        </a>
      </footer>
    </div>
  );
}
