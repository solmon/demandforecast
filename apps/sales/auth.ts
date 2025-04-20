import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getUserRoles } from "@/lib/db-utils";
import { Agent } from "https";

// Define the NextAuth configuration
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      httpOptions: {
        timeout: 40000,
        agent: new Agent({ 
          rejectUnauthorized: false // This bypasses certificate validation, use only in dev environments
        })
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      httpOptions: {
        timeout: 40000,
        agent: new Agent({ 
          rejectUnauthorized: false // This bypasses certificate validation, use only in dev environments
        })
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      
      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }
      
      if (!isLoggedIn) return false;
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // If this is the first sign-in, we'll have account information
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      //app1 -- [admin, driver]
      //app2 -- [client, user]

      // Get user roles from our database
      if (token.email) {
        const userInfo = await getUserRoles(token.email);
        if (userInfo) {
          token.userRole = userInfo.roles;
          token.tenantId = userInfo.tenantId;
          token.tenantName = userInfo.tenantName;
        } else {
          // Default role for new users
          token.userRole = ["user"];
          token.tenantId = "";
          token.tenantName = "";
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session user object
      if (session.user) {
        session.user.roles = token.userRole;
        session.user.tenantId = token.tenantId;
        session.user.tenantName = token.tenantName;
        session.user.accessToken = token.accessToken;
      }
      session.provider = token.provider;
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    provider?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
      tenantId?: string;
      tenantName?: string;
      accessToken?: string;
    }
  }
  
  interface User {
    roles?: string[];
    tenantId?: string;
    tenantName?: string;
    accessToken?: string;
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    userRole?: string[];
    tenantId?: string;
    tenantName?: string;
    accessToken?: string;
    provider?: string;
  }
}

// Export the NextAuth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);