import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface AuthUser {
  email?: string;
  name?: string;
  image?: string;
  roles: string[];
  tenantId: string;
  tenantName: string;
  accessToken?: string;
}

interface UseAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  provider: string | null;
  hasRole: (role: string) => boolean;
  isTenantUser: (tenantId: string) => boolean;
  isCurrentTenant: (tenantId: string) => boolean;
}

/**
 * Custom hook for authentication and authorization
 * 
 * Provides easy access to authentication status, user information, and helper methods
 * for checking roles and tenant permissions.
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const provider = session?.provider || null;

  useEffect(() => {
    if (session?.user) {
      setAuthUser({
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        roles: session.user.roles || [],
        tenantId: session.user.tenantId || "",
        tenantName: session.user.tenantName || "",
        accessToken: session.user.accessToken,
      });
    } else {
      setAuthUser(null);
    }
  }, [session]);

  // Check if user has a specific role
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!authUser) return false;
      return authUser.roles.includes(role);
    },
    [authUser]
  );

  // Check if user belongs to a specific tenant
  const isTenantUser = useCallback(
    (tenantId: string): boolean => {
      if (!authUser) return false;
      return authUser.tenantId === tenantId || authUser.roles.includes("admin");
    },
    [authUser]
  );

  // Check if a tenant ID matches the user's current tenant
  const isCurrentTenant = useCallback(
    (tenantId: string): boolean => {
      if (!authUser) return false;
      return authUser.tenantId === tenantId;
    },
    [authUser]
  );

  return {
    isLoading,
    isAuthenticated,
    user: authUser,
    provider,
    hasRole,
    isTenantUser,
    isCurrentTenant,
  };
}

export default useAuth;