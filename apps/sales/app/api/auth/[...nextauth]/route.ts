import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserRoles } from "@/lib/db-utils";

// Configure authentication options
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
          params: {
            scope: 'openid email profile',
          },
        },  
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // If this is the first sign-in, we'll have account information
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

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
        session.user.roles = token.userRole as string[];
        session.user.tenantId = token.tenantId as string;
        session.user.tenantName = token.tenantName as string;
        session.user.accessToken = token.accessToken as string;
      }
      session.provider = token.provider as string;
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };