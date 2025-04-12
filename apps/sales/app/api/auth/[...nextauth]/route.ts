import NextAuth, { User, Account, Profile, NextAuthOptions, Session, JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import { jwtDecode } from "jwt-decode";

// Custom provider for GCP IAM
import CredentialsProvider from "next-auth/providers/credentials";

// Mock database utility - replace with your actual database service
import { getUserRoles } from "@/src/lib/db-utils";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    // GCP IAM Credentials provider
    CredentialsProvider({
      id: "gcp-iam",
      name: "GCP IAM",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          // Decode the ID token without verification (verification should happen on GCP side)
          const decoded = jwtDecode(credentials.idToken);
          
          // You can validate audience, issuer, etc. here if needed
          // For production, you should verify the token with GCP's tokeninfo endpoint
          
          return {
            id: decoded.sub as string,
            email: decoded.email as string,
            name: decoded.name as string,
            image: decoded.picture as string,
          };
        } catch (error) {
          console.error("GCP IAM token validation error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
      // For domain-restricted SSO providers
      if ((account?.provider === "google" || account?.provider === "gcp-iam") && profile?.email) {
        // You can restrict to specific domains if needed
        // return profile.email.endsWith("@example.com");
        return true;
      }
      
      // Allow other providers - you can add domain or other restrictions here
      return true;
    },
    
    async jwt({ token, user, account }: { token: JWT; user: User; account: Account | null }) {
      // Initial sign in
      if (account && user) {
        try {
          // Get user roles and tenant information from database
          const userInfo = await getUserRoles(user.email as string);
          
          // Add custom claims to the token
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
            userRole: userInfo?.roles || ["user"], // Default to user role if none found
            tenantId: userInfo?.tenantId || "default",
            tenantName: userInfo?.tenantName || "Default Tenant",
            provider: account.provider,
          };
        } catch (error) {
          console.error("Error fetching user roles:", error);
          // Fallback to basic token with default values
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
            userRole: ["user"],
            tenantId: "default",
            tenantName: "Default Tenant",
            provider: account.provider,
          };
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      // This is a placeholder for refresh token logic
      // You would implement token refresh here for production use
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      session.user.roles = token.userRole as string[];
      session.user.accessToken = token.accessToken as string;
      session.user.tenantId = token.tenantId as string;
      session.user.tenantName = token.tenantName as string;
      session.provider = token.provider as string;
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
