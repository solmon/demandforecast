import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUserRoles } from "@/src/lib/db-utils";

/**
 * API route for handling custom JWT token operations
 */
export async function GET(req: NextRequest) {
  try {
    // Verify the token from the request
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    // Return token information - useful for client-side token validation
    return NextResponse.json({
      authenticated: true,
      expires: token.exp,
      user: {
        email: token.email,
        roles: token.userRole,
        tenantId: token.tenantId,
        tenantName: token.tenantName,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error during token verification" },
      { status: 500 }
    );
  }
}

/**
 * Handle token refresh or update
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the existing token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    // Get the email from the token
    const email = token.email as string;
    
    // Refresh user roles from database - useful if roles have changed
    const userInfo = await getUserRoles(email);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    
    // Return updated information - client will need to re-authenticate to get a new token
    return NextResponse.json({
      message: "Token verification successful, but updates require re-authentication",
      shouldReauthenticate: true,
      currentRoles: token.userRole,
      newRoles: userInfo.roles,
      tenantId: userInfo.tenantId,
      tenantName: userInfo.tenantName,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error during token refresh" },
      { status: 500 }
    );
  }
}

/**
 * Handle token validation or checking specific permissions
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify the token from the request
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }
    
    // Parse request to check for specific permission
    const data = await req.json();
    const { permission, role, resource } = data;
    
    const userRoles = token.userRole as string[];
    
    // Check if user has the requested role
    if (role && !userRoles.includes(role)) {
      return NextResponse.json(
        { 
          hasAccess: false,
          reason: `User does not have required role: ${role}`,
        },
        { status: 403 }
      );
    }
    
    // For checking specific permissions, you would implement more detailed logic here
    // For example, connecting to a permissions database or service
    
    return NextResponse.json({
      hasAccess: true,
      roles: userRoles,
      tenantId: token.tenantId,
    });
  } catch (error) {
    console.error("Permission check error:", error);
    return NextResponse.json(
      { error: "Internal server error during permission check" },
      { status: 500 }
    );
  }
}