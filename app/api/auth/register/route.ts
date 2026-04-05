import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/helpers';
import { signToken } from '@/lib/auth';
import { createSecurityLog } from '@/lib/logging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, role = 'contractor', businessName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with profile based on role
    let user;

    if (role === 'contractor') {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          fullName,
          role: 'contractor',
          contractor: {
            create: {
              businessName: businessName || fullName,
            },
          },
        },
        include: {
          contractor: true,
        },
      });
    } else if (role === 'employer') {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          fullName,
          role: 'employer',
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          fullName,
          role: 'worker',
        },
      });
    }

    // Create token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log registration
    await createSecurityLog(user.id, 'registration', true, `User registered as ${role}`, request.ip);

    // Set cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
