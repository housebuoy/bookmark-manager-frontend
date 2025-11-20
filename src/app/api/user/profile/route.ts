// import prisma from "@/lib/prisma";
// import { getSessionCookie } from "better-auth/cookies";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   const session = await getSessionCookie(req);

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id },
//     include: {
//       bookmarks: true,
//       _count: {
//         select: {
//           bookmarks: true,
//           accounts: true,
//         }
//       }
//     }
//   });

//   return NextResponse.json(user);
// }
