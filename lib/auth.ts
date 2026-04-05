import { cookies } from 'next/headers';
import * as crypto from 'crypto';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  const secret = process.env.JWT_SECRET || 'dev-secret-key';
  
  const token = await new Promise<string>((resolve, reject) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })).toString('base64url');
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${header}.${body}`);
    const signature = hmac.digest('base64url');
    
    resolve(`${header}.${body}.${signature}`);
  });
  
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-key';
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [headerB64, bodyB64, signatureB64] = parts;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${headerB64}.${bodyB64}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signatureB64 !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString());
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return null;
    
    return await verifyToken(token);
  } catch (err) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
