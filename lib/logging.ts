import { prisma } from '@/lib/prisma';

export async function createSecurityLog(
  userId: string,
  action: string,
  success: boolean = true,
  details?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await prisma.securityLog.create({
      data: {
        userId,
        action,
        success,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create security log:', error);
  }
}

export async function recordLoginAttempt(userId: string, success: boolean, ipAddress?: string) {
  if (success) {
    // Reset attempts on successful login
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });
  } else {
    // Increment failed attempts
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: userId },
        data: {
          loginAttempts: newAttempts,
          lockedUntil,
        },
      });
    }
  }

  await createSecurityLog(userId, success ? 'login' : 'failed_login', success, undefined, ipAddress);
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.lockedUntil) return false;

  const now = new Date();
  if (user.lockedUntil > now) {
    return true;
  }

  // Unlock if time has passed
  await prisma.user.update({
    where: { id: userId },
    data: { lockedUntil: null, loginAttempts: 0 },
  });

  return false;
}

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  changes?: Record<string, any>,
  admin?: string,
  ipAddress?: string
) {
  try {
    await prisma.adminLog.create({
      data: {
        action,
        entityType,
        entityId,
        changes: changes ? JSON.stringify(changes) : undefined,
        admin,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to create admin log:', error);
  }
}
