import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Footer } from "@/components/customer/Footer";
import { ProductCard } from "@/components/customer/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import headphonesImg from "@/assets/headphones.jpg";
import smartwatchImg from "@/assets/smartwatch.jpg";
import keyboardImg from "@/assets/keyboard.jpg";
import usbHubImg from "@/assets/usb-hub.jpg";

const featuredProducts = [
  { 
    id: 1, 
    name: "Premium Wireless Headphones", 
    price: "$129.99", 
    image: headphonesImg,
    category: "Electronics",
    rating: 4.8,
    isNew: true
  },
  { 
    id: 2, 
    name: "Smart Watch Pro", 
    price: "$299.99", 
    image: smartwatchImg,
    category: "Wearables",
    rating: 4.6,
    discount: "-20%"
  },
  { 
    id: 3, 
    name: "Mechanical Keyboard RGB", 
    price: "$159.99", 
    image: keyboardImg,
    category: "Accessories",
    rating: 4.9
  },
  { 
    id: 4, 
    name: "USB-C Hub Pro", 
    price: "$79.99", 
    image: usbHubImg,
    category: "Accessories",
    rating: 4.7
  },
];

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50"
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure transactions"
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "2-3 business days"
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CustomerHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
              Discover Premium
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Electronics & Accessories
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Shop the latest tech gadgets and accessories with unbeatable prices and quality. 
              Your one-stop destination for all things tech.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/shop">
                <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/shop/deals">
                <Button size="lg" variant="outline">
                  View Deals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">Handpicked favorites just for you</p>
          </div>
          <Link to="/shop">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="gradient-primary rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get exclusive deals, new arrivals, and insider-only discounts delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-background/10 backdrop-blur border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
            <Button size="lg" variant="secondary" className="whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
