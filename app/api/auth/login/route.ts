import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateTransactionId } from '@/lib/helpers';
import { signToken, setAuthCookie } from '@/lib/auth';
import { recordLoginAttempt, isAccountLocked, createSecurityLog } from '@/lib/logging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        contractor: true,
        employer: true,
        worker: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    const locked = await isAccountLocked(user.id);
    if (locked) {
      return NextResponse.json(
        { error: 'Account is temporarily locked. Try again later.' },
        { status: 429 }
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      await recordLoginAttempt(user.id, false, request.ip);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Record successful login
    await recordLoginAttempt(user.id, true, request.ip);

    // Set cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          contractor: user.contractor,
          employer: user.employer,
          worker: user.worker,
        },
      },
      { status: 200 }
    );

    // Set httpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
