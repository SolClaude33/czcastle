import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-pulse" />
          <AlertTriangle className="w-20 h-20 text-destructive relative z-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-display text-foreground">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Lost in the Dungeon?</h2>
          <p className="text-muted-foreground">
            The page you are looking for has been claimed by the void.
          </p>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all border border-white/10 group">
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-bold">Return to Castle</span>
        </Link>
      </div>
    </div>
  );
}
