import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const products = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: "$129.99", stock: 45, status: "In Stock" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: "$299.99", stock: 23, status: "In Stock" },
  { id: 3, name: "Laptop Stand", category: "Accessories", price: "$49.99", stock: 12, status: "Low Stock" },
  { id: 4, name: "USB-C Hub", category: "Accessories", price: "$79.99", stock: 0, status: "Out of Stock" },
  { id: 5, name: "Mechanical Keyboard", category: "Electronics", price: "$159.99", stock: 34, status: "In Stock" },
  { id: 6, name: "Wireless Mouse", category: "Electronics", price: "$39.99", stock: 67, status: "In Stock" },
  { id: 7, name: "Monitor Stand", category: "Accessories", price: "$89.99", stock: 18, status: "In Stock" },
  { id: 8, name: "Webcam HD", category: "Electronics", price: "$119.99", stock: 8, status: "Low Stock" },
];

const Products = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Products</h1>
                <p className="mt-2 text-muted-foreground">Manage your product inventory</p>
              </div>
              <Button className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            <Card className="p-6 animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 bg-muted/50 border-0"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="animate-slide-in">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "In Stock" ? "default" :
                              product.status === "Low Stock" ? "secondary" :
                              "outline"
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
