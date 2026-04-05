import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = payload;

    return handler(authReq);
  };
}

export function withRole(...allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest) => {
      const token = req.cookies.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      req.user = payload;
      return handler(req);
    };
  };
}
