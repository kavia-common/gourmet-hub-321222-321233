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

    // AUTH (mocked by default)
    // PUBLIC_INTERFACE
    async login({ email, password, role }) {
      return tryReal(
        async () => {
          // Typical endpoints might be /auth/login; backend spec currently doesn't expose it.
          return client.post("/auth/login", { email, password, role });
        },
        () => mock.login({ email, password, role })
      );
    },

    // PUBLIC_INTERFACE
    async register({ name, email, password, role }) {
      return tryReal(
        async () => client.post("/auth/register", { name, email, password, role }),
        () => mock.register({ name, email, password, role })
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
      return tryReal(
        async () => client.get("/orders/me"),
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
      return tryReal(
        async () => client.put(`/owner/orders/${orderId}/status`, { status }),
        () => mock.ownerUpdateOrderStatus(orderId, status)
      );
    }
  };
}
