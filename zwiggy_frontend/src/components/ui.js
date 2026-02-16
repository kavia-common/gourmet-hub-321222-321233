import React from "react";
import { Link } from "react-router-dom";
import "./ui.css";

// PUBLIC_INTERFACE
export function Button({ variant = "primary", size = "md", as = "button", className = "", ...props }) {
  const cls = `btn btn-${variant} btn-${size} ${className}`.trim();
  if (as === "link") {
    return <Link className={cls} {...props} />;
  }
  return <button className={cls} {...props} />;
}

// PUBLIC_INTERFACE
export function Card({ className = "", children }) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

// PUBLIC_INTERFACE
export function Input({ label, hint, error, className = "", ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <div className="field-label">{label}</div> : null}
      <input className={`input ${error ? "input-error" : ""}`.trim()} {...props} />
      {error ? <div className="field-error">{error}</div> : null}
      {!error && hint ? <div className="field-hint">{hint}</div> : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Select({ label, children, className = "", ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <div className="field-label">{label}</div> : null}
      <select className="select" {...props}>
        {children}
      </select>
    </label>
  );
}

// PUBLIC_INTERFACE
export function Badge({ children, variant = "default" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// PUBLIC_INTERFACE
export function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {description ? <div className="empty-desc">{description}</div> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
