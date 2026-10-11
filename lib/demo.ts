import prisma from "./prisma";

export const demoEnabled = process.env.PASSFORGE_DEMO === "true";
const lifetime = 60 * 60 * 1000;

export async function reserveDemoSlot(now = new Date()) {
  return prisma.$transaction(async tx => {
    const id = now.toISOString().slice(0, 10);
    await tx.demoBudget.upsert({ where: { id }, create: { id }, update: {} });
    const slot = await tx.demoBudget.updateMany({ where: { id, sessions: { lt: 100 } },
      data: { sessions: { increment: 1 } } });
    if (!slot.count) return false;
    await tx.user.deleteMany({ where: { isAnonymous: true,
      createdAt: { lt: new Date(now.getTime() - lifetime) } } });
    return true;
  });
}

export async function consumeDemoRequest(user: { id: string; createdAt: Date; isAnonymous?: boolean | null }) {
  if (!user.isAnonymous) return false;
  const now = new Date();
  const expiresAt = new Date(new Date(user.createdAt).getTime() + lifetime);
  if (expiresAt <= now) return false;
  await prisma.demoUsage.upsert({ where: { userId: user.id },
    create: { userId: user.id, expiresAt }, update: {} });
  const result = await prisma.demoUsage.updateMany({ where: { userId: user.id,
    expiresAt: { gt: now }, requests: { lt: 200 } }, data: { requests: { increment: 1 } } });
  return result.count === 1;
}
