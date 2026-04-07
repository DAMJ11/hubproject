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
  hasPaymentMethod?: boolean;
}

interface DashboardUserContextType {
  user: DashboardUser | null;
  isLoading: boolean;
  setUser: (user: DashboardUser | null) => void;
}

const DashboardUserContext = createContext<DashboardUserContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

let cachedUser: DashboardUser | null = null;

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(cachedUser === null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          cachedUser = data.user;
          setUser(data.user);

          // Avoid redirect loops by checking current path once on initial session load.
          const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
          if (
            data.user.role === "manufacturer" &&
            data.user.hasPaymentMethod === false &&
            !currentPath.includes("/setup-payment")
          ) {
            router.push("/dashboard/setup-payment");
          }
        } else {
          cachedUser = null;
          router.push("/login");
        }
      })
      .catch(() => {
        cachedUser = null;
        router.push("/login");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  return (
    <DashboardUserContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}
