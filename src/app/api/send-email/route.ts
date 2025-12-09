// src/app/api/send-email/route.ts
import { sendEmail } from "@/lib/brevo";

interface SendVerificationEmailParams {
  user: {
    email: string;
    name?: string;
  };
  url: string;
  token: string;
}

export async function POST(req: Request) {
  try {
    const { user, url } = (await req.json()) as SendVerificationEmailParams;

    // Send email directly
    await sendEmail({
      to: user.email,
      templateId: 1,
      params: {
        VERIFICATION_URL: url,
        USERNAME: user.name || "User",
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }
}
