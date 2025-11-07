"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Share2, Mail } from "lucide-react";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface ShareModalProps {
  title: string;
  url: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type IconActionProps = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
};

function IconAction({ label, icon, onClick, href }: IconActionProps) {
  const content = href ? (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="h-10 w-10 rounded-xl"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
      >
        {icon}
      </a>
    </Button>
  ) : (
    <Button
      variant="outline"
      size="icon"
      className="h-10 w-10 rounded-xl"
      aria-label={label}
      onClick={onClick}
    >
      {icon}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function ShareModal({
  open,
  onOpenChange,
  title,
  url,
  description,
}: ShareModalProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error("Copy failed:", err);
    }
  };

  const nativeShare = async () => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (err) {
        console.error("Native share failed:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(
    title + " " + url
  )}`;
  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title + " " + url
  )}`;
  const emailShare = `mailto:?subject=${encodeURIComponent(
    title
  )}&body=${encodeURIComponent(url)}`;
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[72%]">
        <DialogHeader>
          <DialogTitle>Share Bookmark</DialogTitle>
          <DialogDescription>
            Choose a method or scan the QR code.
          </DialogDescription>
        </DialogHeader>

        {/* <TooltipProvider delayDuration={100}> */}
        {/* Two columns: actions (left) + QR (right) */}
        <div className="grid items-start gap-1 sm:gap-4 sm:grid-cols-[1fr_auto]">
          {/* Uniform icon buttons */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2 justify-items-center">
            <IconAction
              label="Copy"
              icon={<Copy className="h-4 w-4" />}
              onClick={copyToClipboard}
            />
            <IconAction
              label="WhatsApp"
              icon={<FaWhatsapp className="h-4 w-4" />}
              href={whatsappShare}
            />
            <IconAction
              label="X"
              icon={<FaXTwitter className="h-4 w-4" />}
              href={twitterShare}
            />
            <IconAction
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              href={emailShare}
            />
            {canShare && (
              <IconAction
                label="Share"
                icon={<Share2 className="h-4 w-4" />}
                onClick={nativeShare}
              />
            )}
          </div>

          {/* QR code with padding and border */}
          <div className="flex justify-center sm:justify-end">
            <div className="rounded-lg border bg-white p-2">
              <QRCodeSVG
                value={url}
                title={"Title for my QR Code"}
                size={96}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                imageSettings={{
                  src: "/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  opacity: 1,
                  excavate: true,
                }}
              />
            </div>
          </div>
        </div>
        {/* </TooltipProvider> */}
      </DialogContent>
    </Dialog>
  );
}
