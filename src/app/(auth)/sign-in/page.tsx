import SignIn from "@/components/ui/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 sm:grid-cols-2">

      {/* LEFT SIDE — Hidden on Mobile */}
      <div className="hidden sm:flex items-center justify-center bg-black">
        {/* eslint-disable-next-line */}
        <img
          src="https://images.unsplash.com/photo-1491841651911-c44c30c34548?q=80&w=1200"
          alt="Bookmark Background"
          className="h-full w-full object-cover opacity-90"
        />
      </div>

      {/* RIGHT SIDE — Actual Form */}
      <div className="">
        <SignIn />
      </div>
    </div>
  );
}
