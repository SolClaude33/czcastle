import { useScores } from "@/hooks/use-scores";
import { Loader2 } from "lucide-react";

interface HomeLeaderboardProps {
  maxItems?: number;
}

export function HomeLeaderboard({ maxItems = 10 }: HomeLeaderboardProps) {
  const { data: scores, isLoading } = useScores();

  const topScores = scores
    ? [...scores].sort((a, b) => b.score - a.score).slice(0, maxItems)
    : [];

  if (isLoading) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "12px",
        }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (topScores.length === 0) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "12px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        No scores yet
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        padding: "235px 30px 30px 30px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        overflow: "hidden",
      }}
    >
      {topScores.map((score, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;
        
        return (
          <div
            key={score.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: isTopThree
                ? "rgba(255, 215, 106, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              border: isTopThree
                ? "1px solid rgba(255, 215, 106, 0.3)"
                : "1px solid rgba(255, 255, 255, 0.1)",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: isTopThree ? "#FFD76A" : "rgba(255, 255, 255, 0.7)",
                  minWidth: "24px",
                  textAlign: "right",
                }}
              >
                {rank}.
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: isTopThree ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                  fontWeight: isTopThree ? "bold" : "normal",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "180px",
                }}
                title={score.username}
              >
                {score.username}
              </span>
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: isTopThree ? "#FFD76A" : "rgba(255, 255, 255, 0.7)",
                fontFamily: "monospace",
              }}
            >
              {score.score.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
