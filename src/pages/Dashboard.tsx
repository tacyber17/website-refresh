import { StatCard } from "@/components/StatCard";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    changeType: "positive" as const,
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "1,234",
    change: "+12.5% from last month",
    changeType: "positive" as const,
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "573",
    change: "+8.2% from last month",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Growth",
    value: "+24%",
    change: "+4.1% from last month",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
];

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", product: "Wireless Headphones", amount: "$129.99", status: "Completed" },
  { id: "ORD-002", customer: "Jane Smith", product: "Smart Watch", amount: "$299.99", status: "Processing" },
  { id: "ORD-003", customer: "Mike Johnson", product: "Laptop Stand", amount: "$49.99", status: "Completed" },
  { id: "ORD-004", customer: "Sarah Williams", product: "USB-C Hub", amount: "$79.99", status: "Pending" },
  { id: "ORD-005", customer: "Tom Brown", product: "Mechanical Keyboard", amount: "$159.99", status: "Completed" },
];

const Dashboard = () => {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
                  <Button variant="ghost" size="sm">View all</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === "Completed" ? "default" :
                              order.status === "Processing" ? "secondary" :
                              "outline"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
                </div>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create New Order
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                  <Button className="w-full justify-start gradient-primary text-primary-foreground hover:opacity-90">
                    View Reports
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
  );
};

export default Dashboard;
