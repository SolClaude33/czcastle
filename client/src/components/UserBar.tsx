import { useAuth } from "@/context/AuthContext";
import { Trophy } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function formatWalletShort(w: string | undefined): string {
  if (!w) return "—";
  return w.length >= 10 ? w.slice(0, 6) + "…" + w.slice(-4) : w;
}

export function UserBar() {
  const { user, firebaseUser } = useAuth();
  if (!user) return null;

  return (
    <div
      className="fixed top-0 right-0 z-50 px-4 py-3 flex items-center gap-3 bg-secondary/90 backdrop-blur border-b border-l border-white/10 rounded-bl-xl"
      aria-label="Tu perfil y puntuación"
    >
      <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white/20">
        <AvatarImage src={firebaseUser?.photoURL ?? undefined} alt="" />
        <AvatarFallback className="text-xs bg-primary/20 text-foreground">
          {(user.twitterUsername || "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 text-left">
        <span className="text-sm font-medium text-foreground leading-tight">
          @{user.twitterUsername}
        </span>
        <span
          className="text-xs text-muted-foreground font-mono leading-tight"
          title={user.wallet || ""}
        >
          {formatWalletShort(user.wallet)}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1 leading-tight">
          <Trophy className="w-3 h-3 shrink-0" />
          {(user.highScore ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
