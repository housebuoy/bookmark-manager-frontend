import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ui/profile-client";



export default async function ProfilePage() {


  return <ProfileClient  />;
}
