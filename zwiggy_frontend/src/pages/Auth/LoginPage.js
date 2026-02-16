import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import { Button, Card, Input, Select, Badge } from "../../components/ui";
import "../pages.css";

export default function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/restaurants";

  const [email, setEmail] = useState("demo@zwiggy.dev");
  const [password, setPassword] = useState("demo");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const helper = useMemo(() => {
    return role === "owner"
      ? "Try owner@zwiggy.dev / demo"
      : "Try demo@zwiggy.dev / demo";
  }, [role]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await auth.login({ email, password, role });
      nav(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="h1">Welcome back</h1>
        <p className="p">
          Login to browse restaurants, place orders, or manage your store.
        </p>
      </div>

      <Card className="panel">
        <form onSubmit={onSubmit} className="form">
          <div className="form-row">
            <Select label="I am logging in as" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="owner">Restaurant owner</option>
            </Select>
            <div className="hint-box">
              <Badge variant="primary">Demo</Badge>
              <span>{helper}</span>
            </div>
          </div>

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="actions">
            <Button variant="primary" size="lg" disabled={busy} type="submit">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <Button as="link" to="/restaurants" variant="ghost" size="lg">
              Continue as guest
            </Button>
          </div>

          <div className="fineprint">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
