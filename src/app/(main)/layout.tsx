import Header from "@/components/ui/header";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/context/session-context";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  console.log("Session in MainLayout:", session);

  type User = {
    name?: string;
    image?: string;
  };

  const user: User = {
    name: session.user.name,
    image: session.user.image ?? undefined,
  };

  return (
    <SessionProvider initialSession={session}>
      <div className="flex w-full h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full overflow-y-auto">
          <Header user={user} />
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
