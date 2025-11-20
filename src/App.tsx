import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/admin/Users";
import Home from "./pages/customer/Home";
import Shop from "./pages/customer/Shop";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/customer/Login";
import Account from "./pages/customer/Account";
import MFAEnrollment from "./pages/customer/MFAEnrollment";
import MFAVerification from "./pages/customer/MFAVerification";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
          {/* Customer Routes - Default */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/mfa-enrollment" element={<MFAEnrollment />} />
          <Route path="/mfa-verification" element={<MFAVerification />} />


          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <div className="flex h-screen bg-gradient-subtle">
                <Sidebar />
                <div className="flex-1 flex flex-col lg:pl-64">
                  <Header />
                  <main className="flex-1 overflow-y-auto">
                    <Dashboard />
                  </main>
                </div>
              </div>
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedAdminRoute>
              <div className="flex h-screen bg-gradient-subtle">
                <Sidebar />
                <div className="flex-1 flex flex-col lg:pl-64">
                  <Header />
                  <main className="flex-1 overflow-y-auto">
                    <Products />
                  </main>
                </div>
              </div>
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedAdminRoute>
              <div className="flex h-screen bg-gradient-subtle">
                <Sidebar />
                <div className="flex-1 flex flex-col lg:pl-64">
                  <Header />
                  <main className="flex-1 overflow-y-auto">
                    <Users />
                  </main>
                </div>
              </div>
            </ProtectedAdminRoute>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
