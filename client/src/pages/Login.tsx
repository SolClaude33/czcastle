import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Twitter, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, loading, signInWithTwitter, updateWallet, hasWallet } =
    useAuth();
  const [, setLocation] = useLocation();
  const [wallet, setWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const returnTo =
    new URLSearchParams(window.location.search).get("return") ||
    "/game.html?mode=defense";

  const handleTwitterLogin = async () => {
    try {
      await signInWithTwitter();
      toast({
        title: "Listo",
        description: "Sesión iniciada con Twitter",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al iniciar sesión",
        variant: "destructive",
      });
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim()) {
      toast({
        title: "Error",
        description: "Ingresa una dirección de wallet válida",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateWallet(wallet.trim());
      toast({
        title: "Listo",
        description: "Wallet guardada",
      });
      setTimeout(() => {
        window.location.href = returnTo;
      }, 1000);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar wallet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-secondary/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display text-foreground mb-2">
            Castle Clash
          </h1>
          <p className="text-muted-foreground">
            Inicia sesión para jugar Defense
          </p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-6">
              Continúa con Twitter
            </p>
            <Button
              onClick={handleTwitterLogin}
              className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
              size="lg"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Sign in with Twitter
            </Button>
          </div>
        ) : !hasWallet ? (
          <form onSubmit={handleWalletSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Hola,{" "}
                <span className="font-bold text-foreground">
                  @{user.twitterUsername}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Ingresa tu wallet para continuar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet</Label>
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
                className="font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Guardar y jugar
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Hola de nuevo,{" "}
              <span className="font-bold text-foreground">
                @{user.twitterUsername}
              </span>
            </p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              Wallet: {user.wallet}
            </p>
            <Button
              onClick={() => {
                window.location.href = returnTo;
              }}
              className="w-full"
              size="lg"
            >
              Jugar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
