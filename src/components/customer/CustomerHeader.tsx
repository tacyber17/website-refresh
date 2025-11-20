import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export const CustomerHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/shop" className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                ShopHub
              </h1>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/shop" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Shop
              </Link>
              <Link to="/shop/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </Link>
              <Link to="/shop/deals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Deals
              </Link>
              <Link to="/shop/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:px-8">
            <div className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 bg-muted/50 border-0"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/account">
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="default" size="sm">Login</Button>
              </Link>
            )}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-fade-in">
            <Link
              to="/shop"
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-lg"
            >
              Shop
            </Link>
            <Link
              to="/shop/categories"
              className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              Categories
            </Link>
            <Link
              to="/shop/deals"
              className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              Deals
            </Link>
            <div className="px-3 py-2">
              <Input type="search" placeholder="Search products..." className="w-full" />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
