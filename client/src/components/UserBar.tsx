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
      className="fixed top-0 right-0 z-50 flex flex-col items-center gap-1.5 font-pixel min-w-[140px] pt-2 pb-2.5 px-3"
      style={{
        fontFamily: "'Press Start 2P', monospace",
        backgroundImage: "url(/img/usuario_square.png)",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-label="Tu perfil y puntuación"
    >
      <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/20 overflow-hidden rounded-full -mt-0.5">
        <AvatarImage src={firebaseUser?.photoURL ?? undefined} alt="" />
        <AvatarFallback className="text-[10px] bg-primary/20 text-foreground">
          {(user.twitterUsername || "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 items-center text-center">
        <span className="text-[10px] text-foreground leading-tight">
          @{user.twitterUsername}
        </span>
        <span
          className="text-[8px] text-muted-foreground leading-tight"
          title={user.wallet || ""}
        >
          {formatWalletShort(user.wallet)}
        </span>
        <span className="text-[8px] text-muted-foreground flex items-center gap-1 leading-tight">
          <Trophy className="w-2.5 h-2.5 shrink-0" />
          {(user.highScore ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
