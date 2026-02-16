import React, { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { CartProvider } from "./state/CartContext";
import { createZwiggyApi } from "./api/zwiggyApi";

import { RequireAuth, RequireOwner } from "./routes/RouteGuards";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

import RestaurantListPage from "./pages/Restaurants/RestaurantListPage";
import RestaurantDetailsPage from "./pages/Restaurants/RestaurantDetailsPage";

import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/Orders/CheckoutPage";
import OrdersListPage from "./pages/Orders/OrdersListPage";
import OrderTrackingPage from "./pages/Orders/OrderTrackingPage";

import OwnerOverviewPage from "./pages/Owner/OwnerOverviewPage";
import OwnerOrdersPage from "./pages/Owner/OwnerOrdersPage";
import OwnerRestaurantsPage from "./pages/Owner/OwnerRestaurantsPage";

function ApiBoundRoutes({ api }) {
  const auth = useAuth();

  // If you want to force mock mode for all API calls, set preferMock=true here.
  // We keep it false to use backend endpoints if/when they exist.
  const boundApi = useMemo(() => {
    return createZwiggyApi({
      getToken: () => auth.token,
      onLogout: () => auth.logout(),
      preferMock: false
    });
  }, [auth.token]);

  // prefer passed api if given (not used now), otherwise bound
  const effectiveApi = api || boundApi;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/restaurants" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/restaurants" element={<RestaurantListPage api={effectiveApi} />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailsPage api={effectiveApi} />} />

        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage api={effectiveApi} />
            </RequireAuth>
          }
        />

        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersListPage api={effectiveApi} />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <RequireAuth>
              <OrderTrackingPage api={effectiveApi} />
            </RequireAuth>
          }
        />

        <Route
          path="/owner"
          element={
            <RequireOwner>
              <OwnerOverviewPage api={effectiveApi} />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/orders"
          element={
            <RequireOwner>
              <OwnerOrdersPage api={effectiveApi} />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/restaurants"
          element={
            <RequireOwner>
              <OwnerRestaurantsPage api={effectiveApi} />
            </RequireOwner>
          }
        />

        <Route path="*" element={<Navigate to="/restaurants" replace />} />
      </Routes>
    </Layout>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Top-level API instance for providers/pages if needed later.
  // For now we bind API to auth token inside ApiBoundRoutes.
  const api = useMemo(() => {
    // placeholder for future: app-level singleton
    return null;
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider api={createZwiggyApi({ getToken: () => null, onLogout: () => {} })}>
        <CartProvider>
          <ApiBoundRoutes api={api} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
