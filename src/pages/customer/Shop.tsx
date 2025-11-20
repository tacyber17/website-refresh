import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Footer } from "@/components/customer/Footer";
import { ProductCard } from "@/components/customer/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const allProducts = [
  { id: 1, name: "Premium Wireless Headphones", price: "$129.99", image: "/placeholder.svg", category: "Electronics", rating: 4.8, isNew: true },
  { id: 2, name: "Smart Watch Pro", price: "$299.99", image: "/placeholder.svg", category: "Wearables", rating: 4.6, discount: "-20%" },
  { id: 3, name: "Mechanical Keyboard RGB", price: "$159.99", image: "/placeholder.svg", category: "Accessories", rating: 4.9 },
  { id: 4, name: "USB-C Hub Pro", price: "$79.99", image: "/placeholder.svg", category: "Accessories", rating: 4.7 },
  { id: 5, name: "Wireless Mouse Gaming", price: "$59.99", image: "/placeholder.svg", category: "Accessories", rating: 4.5, isNew: true },
  { id: 6, name: "4K Webcam HD", price: "$149.99", image: "/placeholder.svg", category: "Electronics", rating: 4.4 },
  { id: 7, name: "Monitor Stand Aluminum", price: "$89.99", image: "/placeholder.svg", category: "Accessories", rating: 4.6 },
  { id: 8, name: "Laptop Stand Ergonomic", price: "$49.99", image: "/placeholder.svg", category: "Accessories", rating: 4.7, discount: "-15%" },
  { id: 9, name: "Bluetooth Speaker", price: "$99.99", image: "/placeholder.svg", category: "Electronics", rating: 4.8 },
  { id: 10, name: "Phone Case Premium", price: "$29.99", image: "/placeholder.svg", category: "Accessories", rating: 4.3 },
  { id: 11, name: "Tablet Holder", price: "$39.99", image: "/placeholder.svg", category: "Accessories", rating: 4.5 },
  { id: 12, name: "Wireless Charger Fast", price: "$44.99", image: "/placeholder.svg", category: "Electronics", rating: 4.6, isNew: true },
];

const categories = ["All", "Electronics", "Accessories", "Wearables"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = selectedCategory === "All" 
    ? allProducts 
    : allProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CustomerHeader />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="sm:ml-auto">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
