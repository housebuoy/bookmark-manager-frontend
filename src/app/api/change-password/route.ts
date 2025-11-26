import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await auth.api.changePassword({
    body,
    headers: await headers(),
  });

  return Response.json(result);
}
