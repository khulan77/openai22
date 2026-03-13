import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { text, title } = body;


    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error('Invalid input: text is missing or empty', { text, title });
      return NextResponse.json({ 
        error: "Текст оруулна уу (text талбар алга эсвэл хоосон)." 
      }, { status: 400 });
    }

    if (!title || typeof title !== 'string') {
      console.warn('Title missing, using default');
    }

    console.log('Processing:', { text: text.slice(0, 100) + '...', title });  

    const dbUser = await prisma.user.upsert({
      where: { clerkId: clerkId },
      update: { email: user.emailAddresses[0].emailAddress },
      create: { 
        clerkId: clerkId, 
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || "User"
      },
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Чи бол боловсролын туслах. Өгөгдсөн текстийг хураангуйлж, JSON форматаар хариу өг. Хариулт нь 'summary' (стринг) болон 'quiz' (асуулт, сонголт, хариулт агуулсан массив) гэсэн хоёр талбартай байна." 
        },
        { role: "user", content: text.trim() }
      ],
      response_format: { type: "json_object" }, 
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error('OpenAI хариу алга');
    }

    const aiData = JSON.parse(aiResponse);

    
    if (!aiData.summary || !Array.isArray(aiData.quiz)) {
      throw new Error('OpenAI-н хариу буруу форматтай: summary эсвэл quiz дутуу');
    }

    const newArticle = await prisma.article.create({
      data: {
        title: title || "Гарчиггүй",
        content: text,
        summary: aiData.summary,
        userId: dbUser.id,
        quizzes: {
          create: aiData.quiz.map((q: any) => ({
            question: q.question || '',
            options: q.options || [],
            answer: q.answer || '',
          })),
        },
      },
      include: { quizzes: true }
    });

    return NextResponse.json(newArticle);

  } catch (error: any) {
    console.error("OPENAI_ERROR:", error);
    
    if (error.status === 429) {
      return NextResponse.json({ error: "OpenAI квота дууссан байна. Дансаа цэнэглэнэ үү." }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Сервер алдаа' 
    }, { status: 500 });
  }
}
