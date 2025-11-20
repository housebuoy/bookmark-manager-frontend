// ./src/app/(auth)/sign-in/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col w-full h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      {children}
    </main>
  );
}
