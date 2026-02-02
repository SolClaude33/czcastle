import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Wallet, Loader2, Play } from "lucide-react";
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
        title: "Done",
        description: "Signed in with Twitter",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error signing in",
        variant: "destructive",
      });
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim()) {
      toast({
        title: "Error",
        description: "Enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateWallet(wallet.trim());
      toast({
        title: "Done",
        description: "Wallet saved",
      });
      setTimeout(() => {
        window.location.href = returnTo;
      }, 1000);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error saving wallet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="login-page-bg min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="login-page-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Marco Twitter: Twitter_base.png — más grande para que quepa mejor el contenido */}
        <div
          className="relative w-full max-w-[420px] flex flex-col items-center justify-center mb-6"
          style={{ aspectRatio: "1" }}
        >
          <img
            src="/img/Twitter_base.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center w-[80%] h-[80%] gap-2 font-pixel">
            <div className="text-center shrink-0">
              <h1 className="login-title-castle mb-1.5">
                ONEBATTLELEGEND
              </h1>
              <p className="font-pixel text-white/90 text-[10px] sm:text-xs leading-relaxed max-w-[85%] mx-auto">
                login to play defense mode
              </p>
            </div>

            {!user ? (
              <div className="flex flex-col items-center w-full shrink-0 gap-3">
                <p className="font-pixel text-white/90 text-center text-[10px] sm:text-xs leading-relaxed px-2">
                  sign up with twitter to continue
                </p>
                <button
                  type="button"
                  onClick={handleTwitterLogin}
                  className="relative inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg transition-transform hover:scale-105 active:scale-95"
                  aria-label="Sign in with X"
                >
                  <img
                    src="/img/Share_button.png"
                    alt=""
                    className="h-14 w-auto object-contain pointer-events-none block"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <img
                      src="/assets/ui/icon_twitter.png"
                      alt=""
                      className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="font-pixel text-white text-xs sm:text-sm drop-shadow-[0_1px_0_#000]">
                      Sign in with X
                    </span>
                  </span>
                </button>
                <p className="font-pixel text-white/70 text-center text-[9px] sm:text-[10px] leading-relaxed">
                  or try without account
                </p>
                <button
                  type="button"
                  onClick={() => { window.location.href = "/game.html?mode=defense"; }}
                  className="relative inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg transition-transform hover:scale-105 active:scale-95 opacity-90 hover:opacity-100"
                  aria-label="Play demo"
                >
                  <img
                    src="/img/Share_button.png"
                    alt=""
                    className="h-12 w-auto object-contain pointer-events-none block"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="font-pixel text-white text-xs sm:text-sm drop-shadow-[0_1px_0_#000]">
                      DEMO
                    </span>
                  </span>
                </button>
              </div>
            ) : !hasWallet ? (
              <form
                onSubmit={handleWalletSubmit}
                className="flex flex-col items-center w-full space-y-4 font-pixel"
              >
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-white/90 mb-1">
                    Hi,{" "}
                    <span className="font-bold text-white">
                      @{user.twitterUsername}
                    </span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/80">
                    enter your wallet to continue
                  </p>
                </div>
                <div className="w-full space-y-2">
                  <Label
                    htmlFor="wallet"
                    className="font-pixel text-white/90 text-[10px] sm:text-xs"
                  >
                    Wallet
                  </Label>
                  <Input
                    id="wallet"
                    type="text"
                    placeholder="0x..."
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    required
                    className="font-pixel text-xs sm:text-sm bg-black/30 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:active:scale-100"
                  aria-label={isSubmitting ? "Saving…" : "Save and play"}
                >
                  <img
                    src="/img/Share_button.png"
                    alt=""
                    className="h-14 w-auto object-contain pointer-events-none block"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-white" />
                        <span className="font-pixel text-white text-xs sm:text-sm drop-shadow-[0_1px_0_#000]">
                          Saving…
                        </span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        <span className="font-pixel text-white text-xs sm:text-sm drop-shadow-[0_1px_0_#000]">
                          Save and play
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-center font-pixel">
                <p className="text-[10px] sm:text-xs text-white/90">
                  Welcome back,{" "}
                  <span className="font-bold text-white">
                    @{user.twitterUsername}
                  </span>
                </p>
                <p className="font-pixel text-[10px] sm:text-xs text-white/70 break-all px-2">
                  Wallet: {user.wallet}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = returnTo;
                  }}
                  className="relative inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg transition-transform hover:scale-105 active:scale-95"
                  aria-label="Play"
                >
                  <img
                    src="/img/Share_button.png"
                    alt=""
                    className="h-14 w-auto object-contain pointer-events-none block"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    <span className="font-pixel text-white text-xs sm:text-sm drop-shadow-[0_1px_0_#000]">
                      Play
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
