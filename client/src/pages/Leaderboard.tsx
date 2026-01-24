import { useState, useEffect, useRef } from "react";
import { useUsers } from "@/hooks/use-users";
import { useLanguage } from "@/context/LanguageContext";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "wouter";

import seal_512 from "@assets/seal_512.png";

export default function Leaderboard() {
  const { data: users, isLoading, refetch, error } = useUsers();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "latest">("global");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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

  const treasuryData = {
    feesReceived: 1250000,
    rewardsPaid: 850000,
    holderDividends: 300000,
  };

  const rewardsLog = [
    { date: "2024-05-20", player: "ShadowHunter", amount: 1000, reason: t("daily_challenge") },
    { date: "2024-05-20", player: "ShadowHunter", amount: 1000, reason: t("daily_challenge") },
  ];

  const walletActivity = [
    { time: "14:30:05", amount: 500, type: "fees" },
    { time: "14:30:05", amount: 500, type: "fees" },
  ];

  const formatNumber = (n: number) => n.toLocaleString();

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

        <div className="absolute inset-[70px] z-20 flex flex-col" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", textRendering: "geometricPrecision", WebkitFontSmoothing: "antialiased" }}>
          
          <header className="flex flex-wrap items-center justify-center gap-4 py-2 mb-3">
            <Link href="/" data-testid="link-home">
              <img src={seal_512} alt="logo" className="w-16 h-16 cursor-pointer mt-[25px] mb-[25px]" style={{ imageRendering: "pixelated" }} />
            </Link>
            <h1 className="text-4xl tracking-wider drop-shadow-[2px_2px_0_#000] text-[#e8c327]" style={{ textShadow: "3px 3px 0 #000" }}>
              ONEBATTLELEGEND 一战封神
            </h1>
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
                        <span className="text-xl text-[#8B4513] font-bold" data-testid={`text-score-${index + 1}`}>{formatNumber(user.highScore ?? 0)} {t("gold")}</span>
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
                  <span>{t("reason")}</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                  {rewardsLog.map((log, i) => (
                    <div key={i} data-testid={`row-reward-${i}`} className="grid grid-cols-4 gap-3 text-base px-2 py-1 bg-white/30 rounded-lg">
                      <span className="text-[#7a6a5a]">{log.date}</span>
                      <span className="text-[#2a1810]">{log.player}</span>
                      <span className="text-green-600 font-bold">+{log.amount} {t("gold")}</span>
                      <span className="text-[#7a6a5a]">{log.reason}</span>
                    </div>
                  ))}
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
                    <p className="text-xl text-[#2a1810] font-bold" data-testid="value-fees-received">{formatNumber(treasuryData.feesReceived)} {t("gold")}</p>
                  </div>
                  <div className="card-treasury" data-testid="card-rewards-paid">
                    <img src="/img/icons/trophy_gold.png" alt="" className="w-12 h-12 mx-auto mb-2" style={{ imageRendering: "pixelated" }} />
                    <p className="text-sm text-[#5a4a3a] mb-1">{t("rewards_paid")}</p>
                    <p className="text-xl text-[#2a1810] font-bold" data-testid="value-rewards-paid">{formatNumber(treasuryData.rewardsPaid)} {t("gold")}</p>
                  </div>
                  <div className="card-treasury" data-testid="card-dividends">
                    <img src="/img/icons/dividends_arrow.png" alt="" className="w-12 h-12 mx-auto mb-2" style={{ imageRendering: "pixelated" }} />
                    <p className="text-sm text-[#5a4a3a] mb-1">{t("holder_dividends")}</p>
                    <p className="text-xl text-[#2a1810] font-bold" data-testid="value-dividends">{formatNumber(treasuryData.holderDividends)} {t("gold")}</p>
                  </div>
                </div>
              </div>

              <div className="panel-light flex-1">
                <h3 className="text-xl text-[#2a1810] mb-3">{t("tax_flow")}</h3>
                
                <div className="inline-block px-4 py-2 bg-red-800 border-2 border-red-600 rounded-lg mb-3">
                  <span className="text-white text-xl font-bold">{t("tax_rate")}</span>
                </div>

                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="flex-[4] min-w-[120px] bg-[#d4a853]/40 border-2 border-[#d4a853] rounded-lg p-3 text-center" data-testid="tax-players">
                    <img src="/img/icons/coins_stack.png" alt="" className="w-8 h-8 mx-auto mb-1" style={{ imageRendering: "pixelated" }} />
                    <p className="text-2xl font-bold text-[#8B4513]" data-testid="value-tax-players">40%</p>
                    <p className="text-sm text-[#5a4a3a] mt-1">{t("players_pool")} =</p>
                    <p className="text-xs text-[#7a6a5a]">{t("players_pool_desc")}</p>
                  </div>
                  <div className="flex-[3] min-w-[100px] bg-white/40 border-2 border-[#c4b49a] rounded-lg p-3 text-center" data-testid="tax-dividends">
                    <img src="/img/icons/dividends_arrow.png" alt="" className="w-8 h-8 mx-auto mb-1" style={{ imageRendering: "pixelated" }} />
                    <p className="text-2xl font-bold text-[#2a1810]" data-testid="value-tax-dividends">30%</p>
                    <p className="text-sm text-[#5a4a3a] mt-1">{t("holder_divs")}</p>
                  </div>
                  <div className="flex-[3] min-w-[100px] bg-white/40 border-2 border-[#c4b49a] rounded-lg p-3 text-center" data-testid="tax-liquidity">
                    <img src="/img/icons/liquidity_drop.png" alt="" className="w-8 h-8 mx-auto mb-1" style={{ imageRendering: "pixelated" }} />
                    <p className="text-2xl font-bold text-[#2a1810]" data-testid="value-tax-liquidity">30%</p>
                    <p className="text-sm text-[#5a4a3a] mt-1">{t("liquidity")}</p>
                  </div>
                </div>

                <div className="text-sm text-[#5a4a3a] space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
                    {t("funds_wallet_info")}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {t("flaps_auto_info")}
                  </p>
                </div>
              </div>

              <div className="panel-light" data-testid="panel-wallet-activity">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl text-[#2a1810]">{t("wallet_activity")}</h3>
                  <span className="px-3 py-1 bg-red-600 rounded-lg text-base text-white animate-pulse" data-testid="badge-live-wallet">{t("live")}</span>
                </div>
                <p className="text-base text-[#7a6a5a] mb-2">{t("incoming_fees")}</p>
                <div className="space-y-1 max-h-16 overflow-y-auto custom-scrollbar">
                  {walletActivity.map((activity, i) => (
                    <div key={i} data-testid={`row-wallet-${i}`} className="flex flex-wrap items-center gap-4 text-base px-3 py-1 bg-white/30 rounded-lg">
                      <span className="text-[#7a6a5a]">{activity.time}</span>
                      <span className="text-green-600 font-bold">+{activity.amount} {t("gold")} {t("fees_suffix")}</span>
                    </div>
                  ))}
                </div>
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
