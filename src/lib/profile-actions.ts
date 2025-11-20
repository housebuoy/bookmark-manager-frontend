// "use server";

// import prisma from "@/lib/prisma";
// import { auth } from "@/lib/auth";

// export async function getProfile() {
//   const session = await auth.api.getSession();
//   if (!session) return null;

//   return await prisma.user.findUnique({
//     where: { id: session.user.id },
//   });
// }

// export async function updateProfile(data: { name: string; image?: string }) {
//   const session = await auth.api.getSession();
//   if (!session) return { success: false };

//   await prisma.user.update({
//     where: { id: session.user.id },
//     data,
//   });

//   return { success: true };
// }
