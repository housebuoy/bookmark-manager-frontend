"use client";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { useEffect, useMemo, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { toast } from "sonner";
import { FaEnvelope } from "react-icons/fa6";
import { authClient } from "@/lib/auth-client";
import type { Account } from "better-auth";
import { useSession } from "@/context/session-context";

type User = {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: Date;
  emailVerified?: boolean;
  providerId?: string;
};

const providers = [
  { id: "google", label: "Google", icon: FaGoogle, color: "text-red-500" },
  {
    id: "credential",
    label: "Email",
    icon: FaEnvelope,
    color: "text-blue-500",
  },
];

export default function ProfileClient() {
  type User = {
    name?: string;
    image?: string;
    email?: string;
    createdAt?: Date;
    emailVerified?: boolean;
    providerId?: string;
  };

  const { session } = useSession();
  console.log("Session in ProfileClient:", session);
  const user : User = {
    ...session?.user,
    image: session?.user?.image ?? undefined,
  };
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [open, setOpen] = useState(false);

  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const loadBookmarks = useBookmarkStore((state) => state.loadBookmarks);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      await loadBookmarks();
      setIsLoading(false);
    };
    fetch();
  }, [loadBookmarks]);

  const [accounts, setAccounts] = useState<Partial<Account>[]>([]);

  useEffect(() => {
    const loadAccounts = async () => {
      const { data } = await authClient.listAccounts();
      setAccounts(data ?? []);
    };
    loadAccounts();
  }, []);

  const tagsWithCount = useMemo(() => {
    const tagCount: Record<string, number> = {};
    bookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => {
        tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
      });
    });
    return Object.entries(tagCount).map(([name, count], index) => ({
      id: `${index}`,
      name,
      count,
    }));
  }, [bookmarks]);

  const totalBookmarks = bookmarks.length;
  const totalTags = tagsWithCount.length;

  const mostActiveTag =
    tagsWithCount.reduce(
      (prev, current) => (current.count! > prev.count! ? current : prev),
      { name: "N/A", count: 0 }
    ).name || "N/A";

  const lastBookmarkAdded =
    bookmarks
      .slice()
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      )[0]?.title || "N/A";

  if (isLoading) return <p>Loading stats...</p>;

  const dummyPasskeys = [
    { id: "1", name: "MacBook Pro TouchID", icon: "laptop_mac" },
    { id: "2", name: "iPhone FaceID", icon: "smartphone" },
  ];

  const themeOptions = [
    {
      value: "system",
      label: "System",
    },
    {
      value: "light",
      label: "Light",
    },
    {
      value: "dark",
      label: "Dark",
    },
  ];

  const currentLabel =
    themeOptions.find((option) => option.value === theme)?.label ||
    "Select theme...";

  const handleSaveName = () => alert("Name updated (dummy)");
  const handleSaveEmail = () => alert("Email updated (dummy)");
  const handleResendVerification = () =>
    alert("Verification email sent (dummy)");

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return toast.error("All fields are required");
    }

    if (newPassword !== confirmNewPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setIsPasswordUpdating(true);
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data?.message || "Failed to update password");
      }

      toast.success("Password updated successfully!");

      // Optional: clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error("Something went wrong");
      console.log("Error updating password:", err);
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-[#161616] text-[#111418] dark:text-gray-200 font-display">
      <div className="max-w-4xl mx-auto p-4 sm:p-10">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>

        {/* Identity Card */}
        <div className="bg-white dark:bg-[#161616] rounded-xl shadow-lg p-8 flex items-center gap-6 border border-gray-200 dark:border-gray-700 mb-4">
          <Avatar className="rounded-full ring-4 ring-[#054744] dark:ring-[#054744]/50 w-20 h-20">
            <AvatarImage src={user?.image} alt="@evilrabbit" />
            <AvatarFallback>
              {userName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userName}
            </p>

            <p className="text-lg text-indigo-600 dark:text-indigo-400 mb-1">
              {userEmail}
            </p>

            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              {user?.createdAt
                ? `Member since ${new Date(user.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}`
                : "Member since N/A"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Total Bookmarks"
            value={totalBookmarks.toString()}
            color="text-blue-600"
          />
          <StatCard
            title="Total Tags"
            value={totalTags.toString()}
            color="text-green-600"
          />
          <StatCard
            title="Most Active Tag"
            value={mostActiveTag}
            color="text-purple-600"
          />
          <StatCard
            title="Last Bookmark Added"
            value={lastBookmarkAdded}
            color="text-yellow-600"
          />
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-[#161616] rounded-xl shadow p-6 mb-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">Theme Settings</h2>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between" // Set w-full to match the native select width
              >
                {currentLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>No theme found.</CommandEmpty>
                  <CommandGroup>
                    {themeOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          // Update the theme state via the prop
                          setTheme(currentValue);
                          // Close the combobox
                          setOpen(false);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            theme === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-[#161616] rounded-xl shadow p-6 mb-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Save
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Email Verification */}
        {!user?.emailVerified && (
          <div className="bg-white dark:bg-[#161616] rounded-xl shadow p-6 mb-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Email Verification</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200">
                ⚠️ Email address not verified
              </p>
              <button
                onClick={handleResendVerification}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        <div className="bg-white dark:bg-[#161616] rounded-xl shadow p-6 mb-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">
            Security & Connected Accounts
          </h2>

          {/* Password */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Password</h3>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <div className="w-full flex justify-end">
                <Link href="#" className="text-sm text-right underline">
                  Forgot password?
                </Link>
              </div>

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 bg-[#054744] cursor-pointer text-white rounded-md w-full"
                disabled={isPasswordUpdating}
              >
                {isPasswordUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>

          {/* Passkeys */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Passkeys & Devices</h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {dummyPasskeys.map((pk) => (
                <li
                  key={pk.id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-white dark:text-white">{pk.name}</span>
                  <button className="text-red-500">Remove</button>
                </li>
              ))}
            </ul>
            <button className="mt-3 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-md flex items-center gap-2">
              + Add New Passkey
            </button>
          </div>

          {/* Connected Accounts */}
          <div>
            <h3 className="font-semibold mb-2">Connected Accounts</h3>

            {providers.map((provider) => {
              const Icon = provider.icon;

              const isConnected = accounts.some(
                (acc) => acc.providerId === provider.id
              );

              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-md mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`${provider.color} w-5 h-5`} />
                    <span>{provider.label}</span>
                  </div>

                  {isConnected ? (
                    <span className="text-green-500 font-semibold">
                      Connected
                    </span>
                  ) : (
                    <span className="text-gray-400 font-semibold">
                      Not Connected
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950 rounded-xl shadow p-6 border border-red-500/50 dark:border-red-500/40 flex flex-col sm:flex-row gap-3 justify-between">
          <div>
            <h2 className="text-red-600 dark:text-red-500 font-bold">
              Account Management
            </h2>
            <p className="text-sm text-red-500 dark:text-red-400">
              These actions are permanent and cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              Sign Out
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card component
const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) => (
  <div className="bg-white dark:bg-[#161616] rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-gray-500 dark:text-gray-400">{title}</p>
  </div>
);
