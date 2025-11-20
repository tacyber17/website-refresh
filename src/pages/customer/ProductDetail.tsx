import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Footer } from "@/components/customer/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, Star, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import headphonesImg from "@/assets/headphones.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [headphonesImg, headphonesImg, headphonesImg, headphonesImg];

  const features = [
    "Premium build quality",
    "Advanced noise cancellation",
    "40-hour battery life",
    "Bluetooth 5.0 connectivity",
    "Comfortable ear cushions",
    "Built-in microphone"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CustomerHeader />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={images[selectedImage]}
                alt="Product"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in">
            <div>
              <Badge className="mb-2">Electronics</Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Premium Wireless Headphones
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8 - 234 reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <p className="text-4xl font-bold text-foreground">$129.99</p>
              <p className="text-xl text-muted-foreground line-through">$179.99</p>
              <Badge variant="destructive">Save 28%</Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Experience premium audio quality with our flagship wireless headphones. 
              Featuring advanced noise cancellation, 40-hour battery life, and exceptional comfort 
              for all-day listening. Perfect for music lovers and professionals alike.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-foreground">Quantity:</label>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" className="flex-1 gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Card className="p-6 space-y-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">2 Year Warranty</p>
                  <p className="text-sm text-muted-foreground">Full coverage included</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">30-Day Returns</p>
                  <p className="text-sm text-muted-foreground">Hassle-free returns</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-4">Features</h2>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-4">Specifications</h2>
            <dl className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Weight</dt>
                <dd className="font-medium text-foreground">250g</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Battery Life</dt>
                <dd className="font-medium text-foreground">40 hours</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Connectivity</dt>
                <dd className="font-medium text-foreground">Bluetooth 5.0</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <dt className="text-muted-foreground">Charging Time</dt>
                <dd className="font-medium text-foreground">2 hours</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">Color Options</dt>
                <dd className="font-medium text-foreground">Black, White, Blue</dd>
              </div>
            </dl>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
