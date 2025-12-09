import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();

  // Update name/image immediately
  if (body.name || body.image) {
    await auth.api.updateUser({
      body: {
        name: body.name,
        image: body.image,
      },
    });
  }

  // Update email separately (with verification)
  if (body.email) {
    await auth.api.changeEmail({
      body: {
        newEmail: body.email,
        callbackURL: "/dashboard",
      },
    });
  }

  return new Response(JSON.stringify({ success: true }));
}
