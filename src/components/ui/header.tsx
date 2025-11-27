import React from "react";
import SearchBar from "./search-bar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileMenu } from "./user-profile";
import { AddBookmarkModal } from "./add-bookmark-modal";

type User = {
  name?: string;
  image?: string;
};

const Header = ({ user }: { user: User }) => {
  return (
    <>
      <header className="w-full dark:bg-[var(--sidebar)] h-16 py-5 text-black dark:text-white flex items-center justify-between px-4 shadow-sm sticky top-0 bg-white z-50">
        <section className="flex items-center gap-4">
          <SidebarTrigger className="text-black dark:text-white" />
          <SearchBar />
        </section>

        <section className="hidden sm:flex items-center gap-2">
          {/* Show inline on medium+ screens */}
          <AddBookmarkModal />
          <ProfileMenu user={user}/>
        </section>
        <section className="sm:hidden flex">
          <ProfileMenu user={user} />
        </section>
      </header>

      {/* Floating button on small screens */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <AddBookmarkModal showText={false} />
      </div>
    </>
  );
};

export default Header;
