import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";
import { error } from "node:console";

type Event = {
  type: string;
  data: {
    id: number;
    frist_name: string;
    last_name: string;
    email_addresses: { email_address: string }[];
  };
};

export async function POST(req: NextResponse) {
  const webhooksSecret = process.env.CLERK_WEBHOOK_KEY;
  if (!webhooksSecret) {
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 400 },
    );
  }
  const svixId = req.headers.get("svix-id");

  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const webhook = new Webhook(webhooksSecret);
  const body = await req.text();

  try {
    const event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Event;

    if (event.type !== "user.created") {
      return NextResponse.json({ error: "Ignore event" }, { status: 400 });
    }

    const { id, email_addresses, frist_name, last_name } = event.data;

    await prisma.user.create({
      data: {
        email: email_addresses[0].email_address,
        name: `${frist_name} ${last_name}`,
        clerkId: id,
      },
    });

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "invalid signature" }, { status: 500 });
  }
}
