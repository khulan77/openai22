import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const title = body.title?.trim();
    const content = body.content?.trim();
    const summary = body.summary?.trim();
    const quizzes = Array.isArray(body.quizzes) ? body.quizzes : [];

    if (!title || !content || !summary) {
      return NextResponse.json(
        { error: "title, content, summary required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // duplicate хамгаалалт
    const existingArticle = await prisma.article.findFirst({
      where: {
        userId: user.id,
        title,
        content,
      },
      include: {
        quizzes: true,
      },
    });

    if (existingArticle) {
      return NextResponse.json(existingArticle, { status: 200 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: user.id,
        quizzes: quizzes.length
          ? {
              create: quizzes.map((q: any) => ({
                question: q.question,
                options: q.options,
                answer: q.answer,
              })),
            }
          : undefined,
      },
      include: {
        quizzes: true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("CREATE ARTICLE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const articles = await prisma.article.findMany({
      where: { user: { clerkId: clerkId } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}
