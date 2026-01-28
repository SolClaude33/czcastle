import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@/hooks/use-users";
import { useLanguage } from "@/context/LanguageContext";
import { Search, RefreshCw, Loader2, Copy, Check } from "lucide-react";
import { Link } from "wouter";

import seal_512 from "@assets/seal_512.png";

interface TreasuryData {
  fundsBalance: string;
  liquidityBalance: string;
  liquidityTokens: string | null;
}

interface ContractAddressData {
  address: string | null;
}

interface RewardLogEntry {
  id: string;
  txLink: string;
  player: string;
  amount: number;
  createdAt: string;
}

export default function Leaderboard() {
  const { data: users, isLoading, refetch, error } = useUsers();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "latest">("global");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);

  // Ordenar usuarios por highScore (mayor a menor), filtrar los que no tienen highScore o es 0
  const sortedUsers = users
    ? [...users]
        .filter((u) => u.highScore != null && u.highScore > 0)
        .sort((a, b) => (b.highScore ?? 0) - (a.highScore ?? 0))
    : [];
  
  const filteredUsers = searchQuery 
    ? sortedUsers.filter(u => u.twitterUsername?.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedUsers;

  // Debug logging
  useEffect(() => {
    if (users) {
      console.log("[Leaderboard] Users loaded:", users.length, "users with highScore:", sortedUsers.length);
    }
    if (error) {
      console.error("[Leaderboard] Error loading users:", error);
    }
  }, [users, error, sortedUsers.length]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const targetW = 2048;
      const targetH = 1152;
      const scaleX = vw / targetW;
      const scaleY = vh / targetH;
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: treasuryData, isLoading: treasuryLoading } = useQuery<TreasuryData>({
    queryKey: ["treasury"],
    queryFn: async () => {
      const res = await fetch("/api/treasury");
      if (!res.ok) throw new Error("Failed to fetch treasury");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const { data: contractAddressData } = useQuery<ContractAddressData>({
    queryKey: ["contract-address"],
    queryFn: async () => {
      const res = await fetch("/api/contract-address");
      if (!res.ok) return { address: null };
      return res.json();
    },
  });

  const { data: rewardsLog = [], isLoading: rewardsLogLoading } = useQuery<RewardLogEntry[]>({
    queryKey: ["rewards-log"],
    queryFn: async () => {
      const res = await fetch("/api/rewards-log");
      if (!res.ok) throw new Error("Failed to fetch rewards log");
      const raw = await res.json();
      return (raw || []).map((r: { id: string; txLink: string; player: string; amount: number; createdAt: string }) => ({
        ...r,
        createdAt: typeof r.createdAt === "string" ? r.createdAt : (r.createdAt ? new Date(r.createdAt).toISOString() : ""),
      }));
    },
    refetchInterval: 60_000,
  });

  const formatNumber = (n: number) => n.toLocaleString();
  const formatBNB = (s: string) => (parseFloat(s) || 0).toFixed(4);
  
  // Formatea números grandes de $战封神: elimina decimal, cuenta puntos, usa K/M
  const formatGoldTokens = (value: string | null | undefined): string => {
    if (!value) return "0";
    const num = parseFloat(value);
    if (num === 0) return "0";
    
    // Convertir a entero (eliminar decimal)
    const integer = Math.floor(num);
    
    // Formatear con puntos como separadores de miles (formato europeo)
    const formatted = integer.toLocaleString('de-DE'); // Usa punto como separador de miles
    
    // Contar puntos en el string formateado
    const dotCount = (formatted.match(/\./g) || []).length;
    
    if (dotCount === 0) {
      // Sin puntos, número pequeño
      return formatted;
    } else if (dotCount === 1) {
      // 1 punto → usar K (tomar número hasta el primer punto)
      const beforeFirstDot = formatted.split('.')[0];
      return `${beforeFirstDot}K`;
    } else {
      // 2+ puntos → usar M (tomar número hasta el primer punto)
      const beforeFirstDot = formatted.split('.')[0];
      return `${beforeFirstDot}M`;
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "/img/icons/trophy_gold.png";
    if (index === 1) return "/img/icons/coins_stack.png";
    if (index === 2) return "/img/icons/coins_stack.png";
    return null;
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050816]">
      <div 
        ref={containerRef}
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: 2048,
          height: 1152,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <img 
          src="/img/dashboard_bg.png" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />
        
        <img 
          src="/img/frame.png" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          style={{ imageRendering: "pixelated" }}
        />

        <img 
          src="/img/icons/cloud_decor.png" 
          alt="" 
          className="absolute bottom-[60px] left-[60px] w-[180px] h-auto pointer-events-none z-5 opacity-80"
          style={{ imageRendering: "pixelated" }}
        />
        <img 
          src="/img/icons/cloud_decor.png" 
          alt="" 
          className="absolute bottom-[60px] right-[60px] w-[180px] h-auto pointer-events-none z-5 opacity-80 scale-x-[-1]"
          style={{ imageRendering: "pixelated" }}
        />

        <div className="absolute inset-[70px] z-20 flex flex-col" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          
          <header className="flex flex-wrap items-center justify-center gap-4 py-2 mb-3">
            <Link href="/" data-testid="link-home">
              <img src={seal_512} alt="logo" className="w-16 h-16 cursor-pointer mt-[25px] mb-[25px]" style={{ imageRendering: "pixelated" }} />
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl tracking-wider drop-shadow-[2px_2px_0_#000] text-[#e8c327]" style={{ textShadow: "3px 3px 0 #000" }}>
                ONEBATTLELEGEND 一战封神
              </h1>
              {contractAddressData?.address && (
                <div className="flex items-center gap-2">
                  <div 
                    className="relative flex items-center justify-center px-4 py-2"
                    style={{
                      backgroundImage: "url('/img/Share_button.png')",
                      backgroundSize: "100% 100%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      imageRendering: "pixelated",
                      minWidth: "fit-content",
                      minHeight: "50px",
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-[1px_1px_0_#000] whitespace-nowrap" style={{ textShadow: "2px 2px 0 #000" }}>
                      CA: {contractAddressData.address}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (contractAddressData.address) {
                        await navigator.clipboard.writeText(contractAddressData.address);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#d4a853] hover:bg-[#c49842] border-2 border-[#8B4513] transition-all"
                    title={copied ? "Copied!" : "Copy CA"}
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Link
                href="/login"
                data-testid="link-login"
                className="px-4 py-2 rounded-lg text-lg transition-all bg-[#1DA1F2] text-white border-2 border-[#1a8cd8] hover:bg-[#1a8cd8]"
              >
                Login
              </Link>
              <button
                onClick={() => setLanguage("en")}
                data-testid="button-lang-en"
                aria-pressed={language === "en"}
                className="px-4 py-2 rounded-lg text-lg transition-all bg-[#8B0000] text-white border-2 border-[#d4a853] pl-[15px] pr-[15px] ml-[0px] mr-[0px]"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("zh")}
                data-testid="button-lang-zh"
                aria-pressed={language === "zh"}
                className="px-4 py-2 rounded-lg text-lg transition-all bg-[#1a1a2e] text-[#d4a853] border-2 border-[#d4a853]/50 pl-[15px] pr-[15px] ml-[25px] mr-[25px] pt-[8px] pb-[8px]"
              >
                中文
              </button>
            </div>
          </header>

          <div className="flex-1 grid grid-cols-2 gap-5 overflow-hidden">
            
            <div className="flex flex-col gap-4">
              <div className="panel-light flex-1 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl text-[#2a1810] tracking-wide" data-testid="text-hall-of-fame-title">
                      HALL OF FAME
                    </h2>
                  </div>
                  <button 
                    onClick={() => refetch()} 
                    data-testid="button-refresh"
                    className="p-3 rounded-lg bg-[#d4a853]/20 border-2 border-[#d4a853] transition-all"
                  >
                    <RefreshCw className={`w-6 h-6 text-[#2a1810] ${isLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                
                <p className="text-xl text-[#5a4a3a] mb-2">{t("hall_of_fame_zh")}</p>
                <p className="text-lg text-[#7a6a5a] mb-4">{t("global_ranking")}</p>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {(["global", "weekly", "latest"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      data-testid={`button-tab-${tab}`}
                      data-active={activeTab === tab ? "true" : "false"}
                      aria-pressed={activeTab === tab}
                      className={`px-6 py-3 rounded-lg text-lg transition-all border-2 ${
                        activeTab === tab 
                          ? "bg-[#2a1810] text-[#f5e6d3] border-[#2a1810]" 
                          : "bg-transparent text-[#5a4a3a] border-[#c4b49a]"
                      }`}
                    >
                      {t(tab)}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a6a5a]" />
                    <input
                      type="text"
                      placeholder={t("search")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search"
                      className="pl-12 pr-6 py-3 rounded-lg bg-white/50 border-2 border-[#c4b49a] text-lg text-[#2a1810] placeholder:text-[#9a8a7a] outline-none focus:border-[#d4a853] transition-all w-48"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-12 h-12 animate-spin text-[#d4a853]" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 text-xl text-red-500">
                      Error loading users: {error instanceof Error ? error.message : String(error)}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-xl text-[#7a6a5a]">
                      {users && users.length === 0 
                        ? "No users registered yet" 
                        : users && users.length > 0 
                        ? `No users with scores yet (${users.length} users registered)` 
                        : t("no_data")}
                    </div>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <div 
                        key={user.id}
                        data-testid={`row-player-${index + 1}`}
                        className={`flex items-center gap-5 px-5 py-4 rounded-xl transition-all ${
                          index < 3 
                            ? "bg-gradient-to-r from-[#d4a853]/30 to-[#f5e6d3] border-2 border-[#d4a853]" 
                            : "bg-white/30 border border-[#c4b49a]"
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center">
                          {getRankIcon(index) ? (
                            <img src={getRankIcon(index)!} alt="" className="w-10 h-10" style={{ imageRendering: "pixelated" }} />
                          ) : (
                            <span className="text-2xl font-bold text-[#5a4a3a]">{index + 1}</span>
                          )}
                        </div>
                        <span className="flex-1 text-xl text-[#2a1810]" data-testid={`text-username-${index + 1}`}>@{user.twitterUsername}</span>
                        <span className="text-xl text-[#8B4513] font-bold" data-testid={`text-score-${index + 1}`}>{formatNumber(user.highScore ?? 0)} {t("points")}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="panel-light" data-testid="panel-rewards-log">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl text-[#2a1810]">{t("rewards_log")}</h3>
                  <span className="px-3 py-1 bg-red-600 rounded-lg text-base text-white animate-pulse" data-testid="badge-live-rewards">{t("live")}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-base text-[#7a6a5a] mb-2 px-2">
                  <span>{t("date")}</span>
                  <span>{t("player")}</span>
                  <span>{t("amount")}</span>
                  <span>{t("transaction")}</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {rewardsLogLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-[#d4a853]" />
                    </div>
                  ) : rewardsLog.length === 0 ? (
                    <div className="text-center py-4 text-base text-[#7a6a5a]">
                      {t("no_data")}
                    </div>
                  ) : (
                    rewardsLog.map((log, i) => (
                      <div key={log.id} data-testid={`row-reward-${i}`} className="grid grid-cols-4 gap-3 text-base px-2 py-1 bg-white/30 rounded-lg items-center">
                        <span className="text-[#7a6a5a]">{new Date(log.createdAt).toLocaleDateString()}</span>
                        <span className="text-[#2a1810]">{log.player}</span>
                        <span className="text-green-600 font-bold">+{typeof log.amount === "number" ? log.amount.toFixed(4) : log.amount} BNB</span>
                        <a href={log.txLink} target="_blank" rel="noopener noreferrer" className="text-[#1a8cd8] hover:underline truncate" title={log.txLink}>
                          TX
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="panel-light" data-testid="panel-treasury">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl text-[#2a1810]" data-testid="text-treasury-title">{t("treasury_tracking")}</h2>
                  <img src="/img/icons/coins_stack.png" alt="" className="w-10 h-10 ml-auto" style={{ imageRendering: "pixelated" }} data-testid="icon-treasury" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="card-treasury" data-testid="card-fees-received">
                    <img src="/img/icons/coins_stack.png" alt="" className="w-12 h-12 mx-auto mb-2" style={{ imageRendering: "pixelated" }} />
                    <p className="text-sm text-[#5a4a3a] mb-1">{t("fees_received")}</p>
                    <p className="text-xl text-[#2a1810] font-bold" data-testid="value-fees-received">
                      {treasuryLoading ? "…" : formatBNB(treasuryData?.fundsBalance ?? "0")} BNB
                    </p>
                  </div>
                  <div className="card-treasury" data-testid="card-rewards-paid">
                    <img src="/img/icons/trophy_gold.png" alt="" className="w-12 h-12 mx-auto mb-2" style={{ imageRendering: "pixelated" }} />
                    <p className="text-sm text-[#5a4a3a] mb-1">{t("rewards_paid")}</p>
                    <p className="text-xl text-[#2a1810] font-bold" data-testid="value-rewards-paid">0 BNB</p>
                  </div>
                  <div className="card-treasury" data-testid="card-liquidity">
                    <img src="/img/icons/liquidity_drop.png" alt="" className="w-12 h-12 mx-auto mb-2" style={{ imageRendering: "pixelated" }} />
                    <p className="text-sm text-[#5a4a3a] mb-1">{t("liquidity")}</p>
                    <p className="text-xl text-[#2a1810] font-bold" data-testid="value-liquidity">
                      {treasuryLoading ? "…" : (
                        <>
                          {formatBNB(treasuryData?.liquidityBalance ?? "0")} BNB
                          {treasuryData?.liquidityTokens && parseFloat(treasuryData.liquidityTokens) > 0 && (
                            <span className="block text-base mt-1">
                              {formatGoldTokens(treasuryData.liquidityTokens)} $战封神
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="panel-light">
                <h3 className="text-xl text-[#2a1810] mb-3">{t("tax_flow")}</h3>
                
                <div className="inline-block px-4 py-2 bg-red-800 border-2 border-red-600 rounded-lg mb-3">
                  <span className="text-white text-xl font-bold">{t("tax_rate")}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px] bg-[#d4a853]/40 border-2 border-[#d4a853] rounded-lg p-3 text-center" data-testid="tax-players">
                    <img src="/img/icons/coins_stack.png" alt="" className="w-8 h-8 mx-auto mb-1" style={{ imageRendering: "pixelated" }} />
                    <p className="text-2xl font-bold text-[#8B4513]" data-testid="value-tax-players">60%</p>
                    <p className="text-sm text-[#5a4a3a] mt-1">{t("players_pool")}</p>
                    <p className="text-xs text-[#7a6a5a]">{t("players_pool_desc")}</p>
                  </div>
                  <div className="flex-1 min-w-[140px] bg-white/40 border-2 border-[#c4b49a] rounded-lg p-3 text-center" data-testid="tax-liquidity">
                    <img src="/img/icons/liquidity_drop.png" alt="" className="w-8 h-8 mx-auto mb-1" style={{ imageRendering: "pixelated" }} />
                    <p className="text-2xl font-bold text-[#2a1810]" data-testid="value-tax-liquidity">40%</p>
                    <p className="text-sm text-[#5a4a3a] mt-1">{t("liquidity")}</p>
                  </div>
                </div>
              </div>

              <div className="panel-light">
                <img
                  src="/img/1500x500.jpg"
                  alt=""
                  className="w-full h-auto rounded-lg"
                  style={{ imageRendering: "pixelated", maxHeight: "260px", objectFit: "cover", width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .panel-light {
          background: linear-gradient(135deg, #f5e6d3 0%, #e8d5c0 50%, #dcc9b0 100%);
          border: 3px solid #c4a47a;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.3), 0 6px 24px rgba(0, 0, 0, 0.4);
          border-radius: 14px;
          padding: 18px;
        }
        .card-treasury {
          background: linear-gradient(135deg, #fff8f0 0%, #f5e6d3 100%);
          border: 2px solid #c4a47a;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 168, 83, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 168, 83, 0.7);
        }
      `}</style>
    </div>
  );
}
