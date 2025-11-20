import Header from "@/components/ui/header";
import { AppSidebar } from "@/components/ui/app-sidebar";


type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <Header />
          {children}
        </main>
      </div>
  );
}
