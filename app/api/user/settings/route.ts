import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";

const settingsSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  staticId: z.string().min(1, "Static ID обязателен"),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, staticId } = settingsSchema.parse(body);

    // Check if staticId is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { staticId },
    });

    if (existingUser && existingUser.email !== session.user.email) {
      return new NextResponse("Static ID уже занят", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName,
        lastName,
        staticId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse((error as any).errors[0].message, { status: 400 });
    }
    console.error("Settings update error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
