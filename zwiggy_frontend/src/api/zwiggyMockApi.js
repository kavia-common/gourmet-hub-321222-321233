/* eslint-disable no-unused-vars */
/**
 * In-memory mock API for Zwiggy frontend.
 * This is intentionally simple and deterministic for demo/dev.
 */

function money(n) {
  return Math.round(n * 100) / 100;
}

function nowIso() {
  return new Date().toISOString();
}

const seedRestaurants = [
  {
    id: "r1",
    name: "Blue Bowl Bistro",
    cuisine: ["Healthy", "Bowls"],
    rating: 4.6,
    etaMins: 25,
    deliveryFee: 1.99,
    address: "12 Market St",
    imageUrl: null
  },
  {
    id: "r2",
    name: "Crispy Corner",
    cuisine: ["Fast Food", "Burgers"],
    rating: 4.3,
    etaMins: 30,
    deliveryFee: 2.49,
    address: "88 King Ave",
    imageUrl: null
  },
  {
    id: "r3",
    name: "Curry & Co.",
    cuisine: ["Indian", "Curry"],
    rating: 4.7,
    etaMins: 35,
    deliveryFee: 0.99,
    address: "5 Spice Road",
    imageUrl: null
  }
];

const seedMenu = {
  r1: [
    { id: "m1", name: "Salmon Power Bowl", price: 12.99, description: "Salmon, quinoa, greens, lemon dressing", veg: false },
    { id: "m2", name: "Tofu Crunch Bowl", price: 10.5, description: "Crispy tofu, brown rice, slaw, sesame", veg: true },
    { id: "m3", name: "Avocado Super Salad", price: 9.75, description: "Avocado, seeds, greens, citrus vinaigrette", veg: true }
  ],
  r2: [
    { id: "m4", name: "Classic Cheeseburger", price: 8.99, description: "Cheddar, pickles, house sauce", veg: false },
    { id: "m5", name: "Crispy Fries", price: 3.49, description: "Sea salt + paprika", veg: true },
    { id: "m6", name: "Spicy Chicken Burger", price: 9.49, description: "Spiced chicken, slaw, mayo", veg: false }
  ],
  r3: [
    { id: "m7", name: "Butter Paneer", price: 11.25, description: "Creamy tomato gravy", veg: true },
    { id: "m8", name: "Chicken Tikka Masala", price: 12.75, description: "Smoky + rich", veg: false },
    { id: "m9", name: "Garlic Naan", price: 2.25, description: "Soft naan with garlic butter", veg: true }
  ]
};

let users = [
  { id: "u1", name: "Demo Customer", email: "demo@zwiggy.dev", role: "customer", password: "demo" },
  { id: "o1", name: "Demo Owner", email: "owner@zwiggy.dev", role: "owner", password: "demo" }
];

let orders = [];

function genId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}_${Date.now().toString(16)}`;
}

function computeOrderTotals(items) {
  const subtotal = money(items.reduce((sum, it) => sum + it.price * it.quantity, 0));
  const deliveryFee = money(subtotal >= 20 ? 0 : 1.99);
  const tax = money(subtotal * 0.07);
  const total = money(subtotal + deliveryFee + tax);
  return { subtotal, deliveryFee, tax, total };
}

/**
 * PUBLIC_INTERFACE
 * Create mock API
 */
export function createMockApi() {
  return {
    // PUBLIC_INTERFACE
    async login({ email, password, role }) {
      const u = users.find((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.password === password);
      if (!u) throw new Error("Invalid email or password");
      if (role && u.role !== role) throw new Error("Role mismatch");
      return {
        token: `mock-token:${u.id}`,
        user: { id: u.id, name: u.name, email: u.email, role: u.role }
      };
    },

    // PUBLIC_INTERFACE
    async register({ name, email, password, role }) {
      const exists = users.some((x) => x.email.toLowerCase() === String(email).toLowerCase());
      if (exists) throw new Error("Email already registered");
      const id = genId(role === "owner" ? "o" : "u");
      const user = { id, name, email, role: role || "customer", password };
      users = [user, ...users];
      return {
        token: `mock-token:${user.id}`,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      };
    },

    // PUBLIC_INTERFACE
    async listRestaurants() {
      return seedRestaurants;
    },

    // PUBLIC_INTERFACE
    async getRestaurant(restaurantId) {
      const r = seedRestaurants.find((x) => x.id === restaurantId);
      if (!r) throw new Error("Restaurant not found");
      return r;
    },

    // PUBLIC_INTERFACE
    async listMenuItems(restaurantId) {
      return seedMenu[restaurantId] || [];
    },

    // PUBLIC_INTERFACE
    async placeOrder(payload) {
      // payload: { restaurantId, items: [{id,name,price,quantity}], address, paymentMethod }
      const id = genId("ord");
      const createdAt = nowIso();
      const statusTimeline = [
        { status: "PLACED", at: createdAt, note: "Order placed" }
      ];

      const totals = computeOrderTotals(payload.items || []);
      const order = {
        id,
        restaurantId: payload.restaurantId,
        items: payload.items || [],
        address: payload.address || "",
        paymentMethod: payload.paymentMethod || "CARD",
        totals,
        status: "PLACED",
        statusTimeline,
        createdAt
      };

      orders = [order, ...orders];
      return order;
    },

    // PUBLIC_INTERFACE
    async listMyOrders() {
      return orders;
    },

    // PUBLIC_INTERFACE
    async getOrder(orderId) {
      const o = orders.find((x) => x.id === orderId);
      if (!o) throw new Error("Order not found");
      return o;
    },

    // PUBLIC_INTERFACE
    async ownerGetRestaurants() {
      return seedRestaurants;
    },

    // PUBLIC_INTERFACE
    async ownerGetOrders() {
      return orders;
    },

    // PUBLIC_INTERFACE
    async ownerUpdateOrderStatus(orderId, status) {
      const idx = orders.findIndex((x) => x.id === orderId);
      if (idx < 0) throw new Error("Order not found");
      const updated = { ...orders[idx] };
      updated.status = status;
      updated.statusTimeline = [
        { status, at: nowIso(), note: "Status updated" },
        ...(updated.statusTimeline || [])
      ];
      orders = [updated, ...orders.filter((x) => x.id !== orderId)];
      return updated;
    }
  };
}
