import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useUsers() {
  return useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const users = await res.json() as User[];
      return users;
    },
  });
}
