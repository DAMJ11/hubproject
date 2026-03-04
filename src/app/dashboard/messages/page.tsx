"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, MessagesPanel } from "@/components/dashboard";
import type { UserRole } from "@/types/user";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#0d7a5f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <MessagesPanel />
    </DashboardLayout>
  );
}
