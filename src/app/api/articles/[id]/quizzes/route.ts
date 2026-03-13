import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { articleId: params.id }, 
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}