import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import { Button, Card, Input, Select } from "../../components/ui";
import "../pages.css";

export default function RegisterPage() {
  const auth = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("New User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await auth.register({ name, email, password, role });
      nav(role === "owner" ? "/owner" : "/restaurants", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="h1">Create your account</h1>
        <p className="p">Start ordering in minutes—or manage your restaurant.</p>
      </div>

      <Card className="panel">
        <form onSubmit={onSubmit} className="form">
          <div className="form-row">
            <Select label="Account type" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="owner">Restaurant owner</option>
            </Select>
          </div>

          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
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
            autoComplete="new-password"
            hint="Use any password for the mock backend."
          />

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="actions">
            <Button variant="primary" size="lg" disabled={busy} type="submit">
              {busy ? "Creating…" : "Create account"}
            </Button>
            <Button as="link" to="/login" variant="ghost" size="lg">
              Back to login
            </Button>
          </div>

          <div className="fineprint">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
