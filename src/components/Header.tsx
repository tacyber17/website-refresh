import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 justify-between px-4 lg:px-8">
        <div className="flex flex-1 items-center">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 items-center lg:ml-0 ml-4">
            <form className="w-full max-w-lg" action="#" method="GET">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full pl-10 bg-muted/50 border-0"
                  placeholder="Search products, orders..."
                  type="search"
                />
              </div>
            </form>
          </div>
        </div>
        <div className="ml-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
