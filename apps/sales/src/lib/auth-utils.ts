import { jwtVerify, SignJWT } from 'jose';
import { nanoid } from 'nanoid';

/**
 * JWT token configuration
 */
export interface JWTConfig {
  /** Maximum age of the token in seconds */
  maxAge?: number;
  /** Secret used to sign the token */
  secret: string | Uint8Array;
}

/**
 * Custom claims added to the JWT
 */
export interface CustomJWTClaims {
  /** User ID */
  userId: string;
  /** User email */
  email: string;
  /** User role (admin, user, etc) */
  role: string;
  /** Token creation time */
  createdAt: number;
  /** JWT session ID */
  sessionId?: string;
  /** Additional custom claims */
  [key: string]: any;
}

/**
 * Default JWT configuration
 */
const defaultConfig: Partial<JWTConfig> = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

/**
 * Encode a JWT token with custom claims
 */
export async function encodeJWT(claims: CustomJWTClaims, config: JWTConfig): Promise<string> {
  const { maxAge = defaultConfig.maxAge } = config;
  
  // Convert secret to Uint8Array if it's a string
  const secretKey = typeof config.secret === 'string' 
    ? new TextEncoder().encode(config.secret) 
    : config.secret;

  // Create a session ID if not provided
  const sessionId = claims.sessionId || nanoid();

  // Current timestamp in seconds
  const iat = Math.floor(Date.now() / 1000);
  
  // Create and sign the JWT
  return new SignJWT({
    ...claims,
    sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(iat + (maxAge || 0))
    .setJti(nanoid())
    .sign(secretKey);
}

/**
 * Decode and verify a JWT token
 */
export async function decodeJWT(token: string, config: JWTConfig): Promise<CustomJWTClaims> {
  if (!token) throw new Error('Missing token');
  
  // Convert secret to Uint8Array if it's a string
  const secretKey = typeof config.secret === 'string' 
    ? new TextEncoder().encode(config.secret) 
    : config.secret;

  try {
    // Verify the token
    const { payload } = await jwtVerify(token, secretKey, {
      clockTolerance: 15, // 15 seconds tolerance for clock skew
    });
    
    return payload as unknown as CustomJWTClaims;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Generate a custom JWT token for a user
 */
export async function generateUserToken(
  user: { id: string; email: string; role?: string },
  additionalClaims: Record<string, any> = {},
  secret: string | Uint8Array
): Promise<string> {
  const claims: CustomJWTClaims = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    createdAt: Date.now(),
    ...additionalClaims,
  };

  return encodeJWT(claims, { secret });
}

/**
 * Verify token and extract GCP-specific metadata
 */
export async function validateGCPToken(token: string): Promise<Record<string, any> | null> {
  try {
    // For GCP tokens, you'd typically validate using Google's token info endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    
    if (!response.ok) {
      throw new Error('Invalid GCP token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('GCP token validation error:', error);
    return null;
  }
}