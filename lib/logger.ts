import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function logAction(action: string, targetId: string | null = null, details: string | null = null) {
  try {
    const session = await getServerSession(authOptions);
    const actorId = session?.user?.id;

    if (!actorId) {
      console.warn("Attempted to log action without actorId", { action, targetId, details });
      return;
    }

    await prisma.auditLog.create({
      data: {
        action,
        actorId,
        targetId,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}
