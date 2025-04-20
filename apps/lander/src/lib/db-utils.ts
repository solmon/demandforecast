/**
 * Database utility functions for user authentication and authorization
 * 
 * This file contains utilities for connecting to a database and retrieving
 * user-specific information such as roles, permissions, and tenant information.
 */

// Types for multi-tenant user roles
export interface UserRoles {
  userId: string;
  email: string;
  roles: string[];
  tenantId: string;
  tenantName: string;
  permissions?: string[];
}

// In-memory mock database for development and testing
// Replace this with your actual database implementation (MongoDB, PostgreSQL, etc.)
const mockUserDatabase: Record<string, UserRoles> = {
  "user@example.com": {
    userId: "user-123",
    email: "user@example.com",
    roles: ["user"],
    tenantId: "tenant-1",
    tenantName: "Acme Corp"
  },
  "admin@example.com": {
    userId: "admin-456",
    email: "admin@example.com",
    roles: ["admin", "user"],
    tenantId: "tenant-1",
    tenantName: "Acme Corp",
    permissions: ["read", "write", "delete"]
  },
  "support@example.com": {
    userId: "support-789",
    email: "support@example.com",
    roles: ["support"],
    tenantId: "tenant-1",
    tenantName: "Acme Corp",
    permissions: ["read"]
  },
  "tenant2user@example.com": {
    userId: "tenant2-123",
    email: "tenant2user@example.com",
    roles: ["user"],
    tenantId: "tenant-2",
    tenantName: "XYZ Inc"
  }
};

/**
 * Get user roles and tenant information from the database
 * 
 * @param email - User's email address
 * @returns UserRoles object or null if user not found
 */
export async function getUserRoles(email: string): Promise<UserRoles | null> {
  // Mock implementation - replace with actual database query
  // For example, with MongoDB:
  // return await db.collection('users').findOne({ email });
  
  // For demo purposes, we use the mock database
  const normalizedEmail = email.toLowerCase();
  const userInfo = mockUserDatabase[normalizedEmail];
  
  if (!userInfo) {
    console.log(`No user found for email: ${email}`);
    return null;
  }
  
  return userInfo;
}

/**
 * Check if a user has a specific role
 * 
 * @param email - User's email address
 * @param role - Role to check
 * @returns Boolean indicating if user has the role
 */
export async function userHasRole(email: string, role: string): Promise<boolean> {
  const userInfo = await getUserRoles(email);
  return !!userInfo && userInfo.roles.includes(role);
}

/**
 * Get all users for a specific tenant
 * 
 * @param tenantId - Tenant identifier
 * @returns Array of UserRoles objects for the tenant
 */
export async function getUsersByTenant(tenantId: string): Promise<UserRoles[]> {
  // Mock implementation - replace with actual database query
  // For example, with MongoDB:
  // return await db.collection('users').find({ tenantId }).toArray();
  
  return Object.values(mockUserDatabase)
    .filter(user => user.tenantId === tenantId);
}