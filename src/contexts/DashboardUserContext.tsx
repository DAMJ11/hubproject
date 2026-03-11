"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface DashboardUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

interface DashboardUserContextType {
  user: DashboardUser | null;
  isLoading: boolean;
}

const DashboardUserContext = createContext<DashboardUserContextType>({
  user: null,
  isLoading: true,
});

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setIsLoading(false));
  }, [router]);

  return (
    <DashboardUserContext.Provider value={{ user, isLoading }}>
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}
