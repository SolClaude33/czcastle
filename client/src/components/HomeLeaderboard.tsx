import { useUsers } from "@/hooks/use-users";
import { Loader2 } from "lucide-react";

interface HomeLeaderboardProps {
  maxItems?: number;
}

export function HomeLeaderboard({ maxItems = 10 }: HomeLeaderboardProps) {
  const { data: users, isLoading } = useUsers();

  // Filtrar usuarios con highScore > 0 y ordenar por highScore descendente
  const topUsers = users
    ? [...users]
        .filter((u) => u.highScore != null && u.highScore > 0)
        .sort((a, b) => (b.highScore ?? 0) - (a.highScore ?? 0))
        .slice(0, maxItems)
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
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (topUsers.length === 0) {
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
          fontFamily: "'Press Start 2P', monospace",
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
        padding: "205px 30px 30px 30px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflow: "hidden",
      }}
    >
      {topUsers.map((user, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;
        const username = user.twitterUsername || "user";
        const pixelFont = { fontFamily: "'Press Start 2P', monospace" };

        return (
          <div
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  ...pixelFont,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: isTopThree ? "#FFD76A" : "rgba(255, 255, 255, 0.7)",
                  minWidth: "28px",
                  textAlign: "right",
                }}
              >
                {rank}.
              </span>
              <span
                style={{
                  ...pixelFont,
                  fontSize: "14px",
                  color: isTopThree ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                  fontWeight: isTopThree ? "bold" : "normal",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "200px",
                }}
                title={username}
              >
                @{username}
              </span>
            </div>
            <span
              style={{
                ...pixelFont,
                fontSize: "14px",
                fontWeight: "bold",
                color: isTopThree ? "#FFD76A" : "rgba(255, 255, 255, 0.7)",
              }}
            >
              {(user.highScore ?? 0).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
