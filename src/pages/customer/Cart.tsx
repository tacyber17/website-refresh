import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Footer } from "@/components/customer/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

const cartItems = [
  { id: 1, name: "Premium Wireless Headphones", price: 129.99, quantity: 1, image: "/placeholder.svg" },
  { id: 2, name: "Smart Watch Pro", price: 299.99, quantity: 1, image: "/placeholder.svg" },
  { id: 3, name: "USB-C Hub Pro", price: 79.99, quantity: 2, image: "/placeholder.svg" },
];

const Cart = () => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CustomerHeader />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4 animate-fade-in">
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-primary mb-2">${item.price}</p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button variant="ghost" size="sm">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Link to="/shop">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 animate-fade-in">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-medium text-foreground">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-glow mb-4">
                Proceed to Checkout
              </Button>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-success"></span>
                  Free shipping on orders over $50
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-success"></span>
                  30-day money-back guarantee
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-success"></span>
                  Secure checkout
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
