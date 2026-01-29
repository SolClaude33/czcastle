import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "play_now": "Play Now",
    "weekly_top10": "Weekly Top 10",
    "duel": "Duel",
    "defense": "Defense",
    "rankings": "Rankings",
    "weekly_reset": "Weekly Reset",
    "qualifiers": "Qualifiers",
    "playoffs": "Playoffs",
    "finals": "Finals & Rewards",
    "debug_hint": "Press D to toggle debug overlay",
    "hall_of_fame": "HALL OF FAME",
    "hall_of_fame_zh": "Hall of Fame",
    "global_ranking": "GLOBAL ranking (not weekly)",
    "global": "Global",
    "weekly": "Weekly",
    "latest": "Latest",
    "search": "Search",
    "gold": "Gold",
    "points": "Points",
    "treasury_tracking": "Treasury tracking cards",
    "fees_received": "Fees Received (Wallet)",
    "rewards_paid": "Rewards Paid",
    "holder_dividends": "Holder Dividends (Auto)",
    "tax_flow": "Tax Flow card",
    "tax_rate": "Tax Rate 3%",
    "players_pool": "Players Rewards Pool",
    "players_pool_desc": "80% of the 3% tax",
    "holder_divs": "Holder Dividends",
    "liquidity": "Liquidity",
    "funds_wallet_info": "Funds Wallet 40% info line",
    "flaps_auto_info": "Flaps Auto for dividends + liquidity (automatic)",
    "rewards_log": "Rewards Log",
    "wallet_activity": "Wallet Activity",
    "live": "LIVE",
    "incoming_fees": "Incoming Fees",
    "date": "Date",
    "player": "Player",
    "amount": "Amount",
    "reason": "Reason",
    "transaction": "Transaction",
    "tx_link": "TX link (URL)",
    "add_reward": "Add",
    "daily_challenge": "Daily Challenge",
    "fees_suffix": "Fees",
    "no_data": "No data yet",
    "total_players": "Total Players",
  },
  zh: {
    "play_now": "立即游戏",
    "weekly_top10": "每周前10",
    "duel": "决斗",
    "defense": "防御",
    "rankings": "排行榜",
    "weekly_reset": "每周重置",
    "qualifiers": "资格赛",
    "playoffs": "季后赛",
    "finals": "决赛与奖励",
    "debug_hint": "按 D 键切换调试覆盖层",
    "hall_of_fame": "封神榜",
    "hall_of_fame_zh": "封神榜",
    "global_ranking": "全球排名（非每周）",
    "global": "全球",
    "weekly": "每周",
    "latest": "最新",
    "search": "搜索",
    "gold": "金币",
    "points": "积分",
    "treasury_tracking": "金库追踪卡",
    "fees_received": "已收费用（钱包）",
    "rewards_paid": "已发奖励",
    "holder_dividends": "持有者分红（自动）",
    "tax_flow": "税收流向卡",
    "tax_rate": "税率 3%",
    "players_pool": "玩家奖励池",
    "players_pool_desc": "3%税的80%",
    "holder_divs": "持有者分红",
    "liquidity": "流动性",
    "funds_wallet_info": "资金钱包40%信息行",
    "flaps_auto_info": "Flaps自动用于分红+流动性",
    "rewards_log": "奖励日志",
    "wallet_activity": "钱包活动",
    "live": "实时",
    "incoming_fees": "入账费用",
    "date": "日期",
    "player": "玩家",
    "amount": "数量",
    "reason": "原因",
    "transaction": "交易",
    "tx_link": "交易链接 (URL)",
    "add_reward": "添加",
    "daily_challenge": "每日挑战",
    "fees_suffix": "费用",
    "no_data": "暂无数据",
    "total_players": "总玩家",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved === "en" || saved === "zh") {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
