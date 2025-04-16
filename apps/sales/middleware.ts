import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    // Enable secure cookies in production
    secureCookie: process.env.NODE_ENV === "production",
  });

  // If no token and accessing a protected route (including root path), redirect to login
  if (!token && (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/dashboard"))) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check for role-based access
  const userRoles = token?.userRole as string[] || [];
  const tenantId = token?.tenantId as string || "";
  
  // Handle admin routes
  if (req.nextUrl.pathname.startsWith("/dashboard/admin") && !userRoles.includes("admin")) {
    // Redirect non-admin users to regular dashboard
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Handle tenant-specific routes
  if (req.nextUrl.pathname.startsWith("/dashboard/tenant/") && !tenantId) {
    // Redirect users without tenant access to regular dashboard
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Check if user is accessing their own tenant data
  if (req.nextUrl.pathname.startsWith("/dashboard/tenant/")) {
    // Extract tenant ID from URL path using regex or path parsing
    // For example: /dashboard/tenant/tenant-1/users
    const urlTenantId = req.nextUrl.pathname.split("/")[3];  // Extract tenant-1 from path
    
    // If trying to access a different tenant's data and not an admin
    if (urlTenantId && urlTenantId !== tenantId && !userRoles.includes("admin")) {
      // Redirect to their own tenant's dashboard or a forbidden page
      const ownTenantUrl = new URL(`/dashboard/tenant/${tenantId}`, req.url);
      return NextResponse.redirect(ownTenantUrl);
    }
  }

  // Handle support-only routes
  if (req.nextUrl.pathname.startsWith("/dashboard/support") && 
      !userRoles.includes("support") && !userRoles.includes("admin")) {
    // Redirect non-support users to regular dashboard
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"], // Protect root path and dashboard routes
};
