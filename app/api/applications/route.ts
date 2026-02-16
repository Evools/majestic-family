import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const applicationSchema = z.object({
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
    const body = await req.json();
    const validatedData = applicationSchema.parse(body);

    const application = await prisma.recruitmentApplication.create({
      data: {
        ...validatedData,
        status: "PENDING",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the raw list of issues (ZodIssue[]) which contains path and message
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }

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
