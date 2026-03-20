// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> } 
// ) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }


//     const { id } = await params;


//     const article = await prisma.article.findUnique({
//       where: { 
//         id: id,
 
//         user: { clerkId: userId } 
//       },
//       include: {
//         quizzes: true, 
//       },
//     });

//     if (!article) {
//       return NextResponse.json({ error: "Нийтлэл олдсонгүй" }, { status: 404 });
//     }


//     return NextResponse.json(article);

//   } catch (error: any) {
//     console.error("GET_ARTICLE_BY_ID_ERROR:", error);
//     return NextResponse.json(
//       { error: "Нийтлэлийг авахад алдаа гарлаа" }, 
//       { status: 500 }
//     );
//   }
// }
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

    const article = await prisma.article.findFirst({
      where: {
        id,
        user: {
          clerkId: userId,
        },
      },
      include: {
        quizzes: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Нийтлэл олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("GET_ARTICLE_BY_ID_ERROR:", error);
    return NextResponse.json(
      { error: "Нийтлэлийг авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.article.findFirst({
      where: {
        id,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Нийтлэл олдсонгүй" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.quiz.deleteMany({
        where: { articleId: id },
      });

      await tx.quizAttempt.deleteMany({
        where: { articleId: id },
      });

      await tx.userScore.deleteMany({
        where: { articleId: id },
      });

      await tx.article.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ARTICLE_ERROR:", error);
    return NextResponse.json(
      { error: "Устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}