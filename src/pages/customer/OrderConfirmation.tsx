import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Footer } from "@/components/customer/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface OrderData {
  orderNumber: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  orderDate: string;
}

const OrderConfirmation = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrder = localStorage.getItem("lastOrder");
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
      // Clear order data after loading
      localStorage.removeItem("lastOrder");
    } else {
      navigate("/shop");
    }
  }, [navigate]);

  if (!orderData) {
    return null;
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CustomerHeader />
      
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          <Card className="p-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-bold text-foreground text-lg">{orderData.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-medium text-foreground">
                  {new Date(orderData.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-foreground">{orderData.shippingData.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium text-foreground">Safepay - Secure Payment</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Tracking Timeline */}
            <div className="mb-6">
              <h3 className="font-bold text-foreground mb-4">Order Status</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(orderData.orderDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Processing</p>
                    <p className="text-sm text-muted-foreground">Your order is being prepared</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {estimatedDelivery.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Shipping Address */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Shipping Address</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {orderData.shippingData.firstName} {orderData.shippingData.lastName}
                </p>
                <p className="text-muted-foreground">{orderData.shippingData.address}</p>
                <p className="text-muted-foreground">
                  {orderData.shippingData.city}, {orderData.shippingData.state}{" "}
                  {orderData.shippingData.zipCode}
                </p>
                <p className="text-muted-foreground">{orderData.shippingData.country}</p>
                <p className="text-muted-foreground">Phone: {orderData.shippingData.phone}</p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6 animate-fade-in">
            <h3 className="font-bold text-foreground mb-4">Order Items</h3>
            <div className="space-y-4 mb-6">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium text-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-foreground">
                  {orderData.shipping === 0 ? "Free" : `$${orderData.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="font-medium text-foreground">${orderData.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Email Confirmation Notice */}
          <Card className="p-6 bg-muted/50 animate-fade-in">
            <p className="text-sm text-foreground text-center">
              A confirmation email has been sent to <strong>{orderData.shippingData.email}</strong>
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/shop">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
