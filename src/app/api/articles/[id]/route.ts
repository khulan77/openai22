import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }


    const { id } = await params;


    const article = await prisma.article.findUnique({
      where: { 
        id: id,
 
        user: { clerkId: userId } 
      },
      include: {
        quizzes: true, 
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Нийтлэл олдсонгүй" }, { status: 404 });
    }


    return NextResponse.json(article);

  } catch (error: any) {
    console.error("GET_ARTICLE_BY_ID_ERROR:", error);
    return NextResponse.json(
      { error: "Нийтлэлийг авахад алдаа гарлаа" }, 
      { status: 500 }
    );
  }
}