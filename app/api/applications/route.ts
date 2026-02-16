import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const ApplicationSchema = z.object({
  discordId: z.string().min(1, "Необходимо указать Discord ID"),
  discordName: z.string().min(1, "Необходимо указать имя в Discord"),
  /* Validating age manually to provide Russian error message for invalid type (null) */
  age: z.any().transform((val, ctx) => {
    const parsed = Number(val);
    if (val === null || val === undefined || val === "" || isNaN(parsed)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Введите корректный возраст" });
      return z.NEVER;
    }
    return parsed;
  }).pipe(z.number().min(16, "Минимальный возраст 16 лет")),
  staticId: z.string().min(1, "Необходимо указать статический ID"),
  experience: z.string().min(10, "Пожалуйста, расскажите подробнее о вашем опыте (минимум 10 символов)"),
  reason: z.string().min(10, "Пожалуйста, расскажите, почему вы хотите вступить (минимум 10 символов)"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = ApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { discordName, discordId, age, staticId, experience, reason } = result.data;

    // Check if user already has an application
    const existingApplication = await prisma.recruitmentApplication.findUnique({
      where: { userId: session.user.id }
    });

    if (existingApplication) {
      return NextResponse.json({ error: "You have already submitted an application." }, { status: 400 });
    }

    const application = await prisma.recruitmentApplication.create({
      data: {
        userId: session.user.id,
        discordName,
        discordId,
        age,
        staticId,
        experience,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to submit application:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        details: String(error)
      },
      { status: 500 }
    );
  }
}
