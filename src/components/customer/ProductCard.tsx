import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  rating?: number;
  isNew?: boolean;
  discount?: string;
}

export const ProductCard = ({ id, name, price, image, category, rating = 4.5, isNew, discount }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id,
      name,
      price: parseFloat(price.replace('$', '')),
      image,
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
      <Link to={`/shop/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isNew && (
            <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
              New
            </Badge>
          )}
          {discount && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              {discount}
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur hover:bg-background"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{category}</p>
        <Link to={`/shop/product/${id}`}>
          <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-warning fill-warning' : 'text-muted'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">({rating})</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-foreground">{price}</p>
          <Button 
            size="sm" 
            className="gradient-primary text-primary-foreground hover:opacity-90"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
