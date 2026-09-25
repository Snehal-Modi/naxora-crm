"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserProfile } from "@/types/auth";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = typeof window !== "undefined" ? localStorage.getItem("naxora_access_token") : null;
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await authApi.getMe();
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        if (typeof window !== "undefined") {
          localStorage.removeItem("naxora_access_token");
          localStorage.removeItem("naxora_refresh_token");
        }
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = pathname === "/login" || pathname === "/reset-password";
      if (!user && !isAuthRoute) {
        router.push("/login");
      } else if (user && isAuthRoute) {
        router.push("/");
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const tokenData = await authApi.login(email, password);
    if (typeof window !== "undefined") {
      localStorage.setItem("naxora_access_token", tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem("naxora_refresh_token", tokenData.refresh_token);
      }
    }
    setUser(tokenData.user);
    router.push("/");
    return tokenData.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.is_superuser || user.permissions.includes("*")) return true;
    return user.permissions.includes(permissionCode);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.roles.includes(roleName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

