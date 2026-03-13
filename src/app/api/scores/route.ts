import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { articleId, score, timeSpent } = await req.json();

   
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      return new NextResponse("User not found in database", { status: 404 });
    }

   
    if (!articleId) {
      return NextResponse.json({ error: "articleId шаардлагатай" }, { status: 400 });
    }

    const newScore = await prisma.quizAttempt.create({
      data: {
        userId: user.id,     
        articleId: articleId,
        score: Number(score), 
        timeSpent: timeSpent || 0,
      },
    });

    return NextResponse.json(newScore);
  } catch (error: any) {
    console.error("SCORE_POST_ERROR:", error);
    return NextResponse.json({ error: "Оноо хадгалахад алдаа гарлаа" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }


    const scores = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        ...(articleId ? { articleId } : {}),
      },
      include: {
        article: {
          select: { title: true } 
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("SCORE_GET_ERROR:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}