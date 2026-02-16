import { createApiClient } from "./client";
import { createMockApi } from "./zwiggyMockApi";

/**
 * PUBLIC_INTERFACE
 * Create the Zwiggy API with optional mock fallback.
 * If backend lacks required endpoints (or errors), we automatically use mock data.
 *
 * @param {{ getToken: () => (string|null), onLogout: () => void, preferMock?: boolean }} deps
 */
export function createZwiggyApi(deps) {
  const client = createApiClient({
    getToken: deps.getToken,
    onUnauthorized: deps.onLogout
  });

  const mock = createMockApi();

  const preferMock = Boolean(deps.preferMock);

  async function tryReal(fn, fallbackFn) {
    if (preferMock) return fallbackFn();
    try {
      return await fn();
    } catch (e) {
      // If backend is minimal/unavailable, keep UI working.
      return fallbackFn(e);
    }
  }

  return {
    // PUBLIC_INTERFACE
    async health() {
      return tryReal(() => client.get("/"), () => ({ ok: true, source: "mock" }));
    },

    // AUTH
    // PUBLIC_INTERFACE
    async login({ email, password, role }) {
      // Backend OpenAPI: POST /auth/login expects {email, password}
      // Role is a frontend concept for routing; backend determines role from stored user.
      return tryReal(
        async () => client.post("/auth/login", { email, password }),
        () => mock.login({ email, password, role })
      );
    },

    // PUBLIC_INTERFACE
    async register({ name, email, password, role }) {
      // Backend OpenAPI: POST /auth/signup expects {email, password, role, full_name?}
      return tryReal(
        async () =>
          client.post("/auth/signup", {
            email,
            password,
            role,
            full_name: name || null
          }),
        () => mock.register({ name, email, password, role })
      );
    },

    // PUBLIC_INTERFACE
    async me() {
      return tryReal(
        async () => client.get("/auth/me"),
        // In mock mode, return a minimal identity if present
        () => ({ id: 0, email: "mock@zwiggy.dev", role: "customer", full_name: "Mock User", is_active: true, created_at: new Date().toISOString() })
      );
    },

    // Restaurants
    // PUBLIC_INTERFACE
    async listRestaurants() {
      return tryReal(
        async () => client.get("/restaurants"),
        () => mock.listRestaurants()
      );
    },

    // PUBLIC_INTERFACE
    async getRestaurant(restaurantId) {
      return tryReal(
        async () => client.get(`/restaurants/${restaurantId}`),
        () => mock.getRestaurant(restaurantId)
      );
    },

    // Menu
    // PUBLIC_INTERFACE
    async listMenuItems(restaurantId) {
      return tryReal(
        async () => client.get(`/restaurants/${restaurantId}/menu`),
        () => mock.listMenuItems(restaurantId)
      );
    },

    // Orders
    // PUBLIC_INTERFACE
    async placeOrder(payload) {
      return tryReal(
        async () => client.post("/orders", payload),
        () => mock.placeOrder(payload)
      );
    },

    // PUBLIC_INTERFACE
    async listMyOrders() {
      // Backend OpenAPI: GET /orders returns the authenticated customer's orders.
      return tryReal(
        async () => client.get("/orders"),
        () => mock.listMyOrders()
      );
    },

    // PUBLIC_INTERFACE
    async getOrder(orderId) {
      return tryReal(
        async () => client.get(`/orders/${orderId}`),
        () => mock.getOrder(orderId)
      );
    },

    // Owner dashboard
    // PUBLIC_INTERFACE
    async ownerGetRestaurants() {
      return tryReal(
        async () => client.get("/owner/restaurants"),
        () => mock.ownerGetRestaurants()
      );
    },

    // PUBLIC_INTERFACE
    async ownerGetOrders() {
      return tryReal(
        async () => client.get("/owner/orders"),
        () => mock.ownerGetOrders()
      );
    },

    // PUBLIC_INTERFACE
    async ownerUpdateOrderStatus(orderId, status) {
      // Backend OpenAPI: POST /owner/orders/{order_id}/status
      // Body: { status, note? }
      return tryReal(
        async () => client.post(`/owner/orders/${orderId}/status`, { status }),
        () => mock.ownerUpdateOrderStatus(orderId, status)
      );
    }
  };
}
