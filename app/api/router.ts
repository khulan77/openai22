import { NextResponse } from "next/server";

export async function Post(request: Request) {
try{
    const user = await prisma.user.create({
        data: {
            email: "alice@prisma.io",
            id: "1",
        },
    });
    console.log(user);
    return NextResponse.json({message: "User created successfully"},{status:201});
} catch (error) {
    console.error(error);
    return new Response("Error crteating user", {status : 500})
}
}