import { Link, useLocation } from "wouter";
import { Trophy, Swords, Home, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/login", label: "Login", icon: LogIn },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Swords className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl md:text-2xl text-foreground drop-shadow-md">
            Castle Clash
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4 bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                  <span className="hidden md:block font-medium text-sm">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
