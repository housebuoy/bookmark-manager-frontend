import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ui/profile-client";

export default async function ProfilePage() {
  // Get session on the SERVER
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  // const user = await prisma.user.findUnique({
  //   where: { id: session.user.id },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //     image: true,
  //     emailVerified: true,
  //     createdAt: true,
  //   },
  // });

  const user = {
    ...session.user,
    image: session.user.image ?? undefined,
  };

  return <ProfileClient user={user} />;
}
