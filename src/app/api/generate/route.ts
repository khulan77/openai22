// import { auth, currentUser } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import OpenAI from "openai";
// import { NextResponse } from "next/server";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: Request) {
//   try {
//     const { userId: clerkId } = await auth();
//     const user = await currentUser();

//     if (!clerkId || !user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { text, title, articleId } = body;

//     if (!text || typeof text !== "string" || text.trim().length === 0) {
//       return NextResponse.json(
//         { error: "Текст оруулна уу." },
//         { status: 400 }
//       );
//     }

//     const dbUser = await prisma.user.upsert({
//       where: { clerkId },
//       update: {
//         email: user.emailAddresses[0].emailAddress,
//       },
//       create: {
//         clerkId,
//         email: user.emailAddresses[0].emailAddress,
//         name: user.firstName || "User",
//       },
//     });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: `
// Чи бол боловсролын туслах.
// Өгөгдсөн текстийг хураангуйлж, JSON форматаар хариул.

// JSON бүтэц:
// {
//   "summary": "string",
//   "quiz": [
//     {
//       "question": "string",
//       "options": ["string", "string", "string", "string"],
//       "answer": 0
//     }
//   ]
// }

// Дүрэм:
// - summary нь string байна
// - quiz нь массив байна
// - options яг 4 сонголттой байна
// - answer нь options доторх зөв хариултын INDEX байна
// - answer нь 0-3 хооронд number байна
// - answer-ийг текстээр биш, index-аар буцаа
// `,
//         },
//         {
//           role: "user",
//           content: text.trim(),
//         },
//       ],
//       response_format: { type: "json_object" },
//     });

//     const aiResponse = completion.choices[0].message.content;

//     if (!aiResponse) {
//       throw new Error("OpenAI хариу алга");
//     }

//     const aiData = JSON.parse(aiResponse);

//     if (!aiData.summary || !Array.isArray(aiData.quiz)) {
//       throw new Error("OpenAI хариу буруу форматтай");
//     }

// const normalizedQuiz = aiData.quiz.map((q: any) => {
//   const options = Array.isArray(q.options) ? q.options : [];

//   let answerIndex = -1;

//   // 1. Хэрвээ number бол шууд авна
//   if (typeof q.answer === "number") {
//     answerIndex = q.answer;
//   }

//   // 2. Хэрвээ string бол option-оос хайна (case insensitive)
//   else if (typeof q.answer === "string") {
//     answerIndex = options.findIndex(
//       (opt: string) =>
//         opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
//     );
//   }

//   // 3. Хэрвээ олдохгүй бол default 0
//   if (answerIndex === -1 || answerIndex >= options.length) {
//     answerIndex = 0;
//   }

//   return {
//     question: q.question || "",
//     options,
//     answer: answerIndex,
//   };
// });

//     // 1) History дээрээс Take Quiz дарахад:
//     // articleId ирвэл тухайн article дээр quiz save хийнэ
//     if (articleId) {
//       const existingArticle = await prisma.article.findFirst({
//         where: {
//           id: articleId,
//           userId: dbUser.id,
//         },
//         include: {
//           quizzes: true,
//         },
//       });

//       if (!existingArticle) {
//         return NextResponse.json(
//           { error: "Article not found" },
//           { status: 404 }
//         );
//       }

//       if (existingArticle.quizzes.length > 0) {
//         return NextResponse.json(existingArticle, { status: 200 });
//       }

//       await prisma.quiz.createMany({
//         data: normalizedQuiz.map((q: any) => ({
//           articleId: existingArticle.id,
//           question: q.question,
//           options: q.options,
//           answer: q.answer,
//         })),
//       });

//       const updatedArticle = await prisma.article.findUnique({
//         where: { id: existingArticle.id },
//         include: { quizzes: true },
//       });

//       return NextResponse.json(updatedArticle, { status: 200 });
//     }

//     // 2) Home дээр Generate Summary дарахад:
//     // зөвхөн preview data буцаана, DB рүү save хийхгүй
//     return NextResponse.json(
//       {
//         title: title || "Гарчиггүй",
//         summary: aiData.summary,
//         quiz: normalizedQuiz,
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("OPENAI_ERROR:", error);

//     if (error?.status === 429) {
//       return NextResponse.json(
//         { error: "OpenAI квота дууссан байна. Дансаа цэнэглэнэ үү." },
//         { status: 429 }
//       );
//     }

//     return NextResponse.json(
//       { error: error.message || "Сервер алдаа" },
//       { status: 500 }
//     );
//   }
// }
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { text, title, articleId } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Текст оруулна уу." },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: user.emailAddresses[0].emailAddress,
      },
      create: {
        clerkId,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || "User",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Чи бол боловсролын туслах.
Өгөгдсөн текстийг хураангуйлж, JSON форматаар хариул.

JSON бүтэц:
{
  "summary": "string",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": 0
    }
  ]
}

Дүрэм:
- summary нь string байна
- quiz нь массив байна
- options яг 4 сонголттой байна
- answer нь options доторх зөв хариултын INDEX байна
- answer нь 0-3 хооронд number байна
- answer-ийг текстээр биш, index-аар буцаа
- 5 асуулт үүсгэ
`,
        },
        {
          role: "user",
          content: text.trim(),
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      throw new Error("OpenAI хариу алга");
    }

    const aiData = JSON.parse(aiResponse);

    if (!aiData.summary || !Array.isArray(aiData.quiz)) {
      throw new Error("OpenAI хариу буруу форматтай");
    }

    const normalizedQuiz = aiData.quiz
      .map((q: any) => {
        const options = Array.isArray(q.options)
          ? q.options
              .filter((opt: any) => typeof opt === "string" && opt.trim() !== "")
              .slice(0, 4)
          : [];

        let answerIndex = -1;

        if (typeof q.answer === "number") {
          answerIndex = q.answer;
        } else if (typeof q.answer === "string") {
          const numericAnswer = Number(q.answer);

          if (!Number.isNaN(numericAnswer)) {
            answerIndex = numericAnswer;
          } else {
            answerIndex = options.findIndex(
              (opt: string) =>
                opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
            );
          }
        }

        if (answerIndex < 0 || answerIndex >= options.length) {
          answerIndex = 0;
        }

        return {
          question: typeof q.question === "string" ? q.question.trim() : "",
          options,
          answer: answerIndex,
        };
      })
      .filter(
        (q: any) => q.question !== "" && Array.isArray(q.options) && q.options.length > 0
      );

    if (normalizedQuiz.length === 0) {
      throw new Error("Quiz үүсгэж чадсангүй");
    }

    // History дээрээс Take Quiz дарахад:
    // байгаа article дээр quiz-ийг delete + recreate хийнэ
    if (articleId) {
      const existingArticle = await prisma.article.findFirst({
        where: {
          id: articleId,
          userId: dbUser.id,
        },
      });

      if (!existingArticle) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      await prisma.quiz.deleteMany({
        where: { articleId: existingArticle.id },
      });

      await prisma.quiz.createMany({
        data: normalizedQuiz.map((q: any) => ({
          articleId: existingArticle.id,
          question: q.question,
          options: q.options,
          answer: String(q.answer),
        })),
      });

      const updatedArticle = await prisma.article.findUnique({
        where: { id: existingArticle.id },
        include: { quizzes: true },
      });

      return NextResponse.json(updatedArticle, { status: 200 });
    }

    // Home дээр Generate Summary дарахад:
    // preview data л буцаана
    return NextResponse.json(
      {
        title: title || "Гарчиггүй",
        summary: aiData.summary,
        quiz: normalizedQuiz,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("OPENAI_ERROR:", error);

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "OpenAI квота дууссан байна. Дансаа цэнэглэнэ үү." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Сервер алдаа" },
      { status: 500 }
    );
  }
}