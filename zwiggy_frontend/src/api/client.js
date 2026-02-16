/**
 * Zwiggy API client
 * - Uses REACT_APP_API_BASE (fallback REACT_APP_BACKEND_URL)
 * - Handles JSON + FormData
 * - Adds Authorization header when auth token present
 */

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:3001";

/**
 * PUBLIC_INTERFACE
 * Create a new API client instance.
 * @param {{ getToken?: () => (string|null), onUnauthorized?: () => void }} deps
 * @returns {{ get: Function, post: Function, put: Function, del: Function, request: Function, baseUrl: string }}
 */
export function createApiClient(deps = {}) {
  const getToken = deps.getToken || (() => null);
  const onUnauthorized = deps.onUnauthorized || (() => {});

  async function request(path, options = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const token = getToken();

    const headers = new Headers(options.headers || {});
    const hasBody = typeof options.body !== "undefined";

    // If body is a plain object, send as JSON.
    let body = options.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

    if (hasBody && !isFormData && !isBlob && body && typeof body === "object") {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    headers.set("Accept", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body
    });

    if (res.status === 401) {
      onUnauthorized();
    }

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    let data = null;
    if (res.status !== 204) {
      data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
    }

    if (!res.ok) {
      const message =
        (data && (data.detail || data.message)) ||
        `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  return {
    baseUrl: API_BASE,
    request,
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    del: (path) => request(path, { method: "DELETE" })
  };
}
