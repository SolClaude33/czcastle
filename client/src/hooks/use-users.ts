import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useUsers() {
  return useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[useUsers] Failed to fetch users:", res.status, errorText);
        throw new Error(`Failed to fetch users: ${res.status}`);
      }
      const users = await res.json() as User[];
      console.log("[useUsers] Fetched users:", users.length);
      return users;
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}
