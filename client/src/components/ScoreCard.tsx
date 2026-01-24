import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

interface ScoreCardProps {
  rank: number;
  username: string;
  score: number;
  delay?: number;
}

export function ScoreCard({ rank, username, score, delay = 0 }: ScoreCardProps) {
  const isTopThree = rank <= 3;
  
  const getRankColor = (r: number) => {
    switch (r) {
      case 1: return "from-yellow-300 to-yellow-600 border-yellow-500/50 shadow-yellow-500/20";
      case 2: return "from-slate-300 to-slate-500 border-slate-400/50 shadow-slate-500/20";
      case 3: return "from-amber-600 to-amber-800 border-amber-600/50 shadow-amber-700/20";
      default: return "from-secondary to-secondary/80 border-border/50 shadow-black/20";
    }
  };

  const getRankIcon = (r: number) => {
    switch (r) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-100" />;
      case 2: return <Medal className="w-6 h-6 text-slate-100" />;
      case 3: return <Medal className="w-6 h-6 text-amber-100" />;
      default: return <span className="text-muted-foreground font-pixel text-xs">#{r}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`
        relative overflow-hidden group
        flex items-center justify-between p-4 rounded-xl border-2
        bg-gradient-to-br shadow-xl backdrop-blur-sm
        transition-all duration-300
        ${getRankColor(rank)}
      `}
    >
      <div className="flex items-center gap-4 z-10">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          bg-black/20 backdrop-blur-md shadow-inner border border-white/10
        `}>
          {getRankIcon(rank)}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isTopThree ? 'text-white' : 'text-foreground'}`}>
            {username}
          </h3>
          <p className={`text-xs ${isTopThree ? 'text-white/80' : 'text-muted-foreground'}`}>
            Rank {rank}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 z-10">
        <span className={`font-pixel text-sm md:text-base ${isTopThree ? 'text-white' : 'text-primary'}`}>
          {score.toLocaleString()}
        </span>
        <span className={`text-xs ${isTopThree ? 'text-white/60' : 'text-muted-foreground'}`}>PTS</span>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
    </motion.div>
  );
}
