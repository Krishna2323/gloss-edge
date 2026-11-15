"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ROUTES } from "@/constants/routes";

const SocialAuthForm = () => {
  const handleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: ROUTES.HOME, redirect: false });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not sign in with Google."
      );
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-5">
      <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.08em] text-fg-faint">
        <span className="h-px flex-1 bg-white/[0.08]" />
        OR
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
      <Button type="button" variant="raised" size="tap" onClick={handleSignIn}>
        <Image
          src="/icons/google.svg"
          alt=""
          width={20}
          height={20}
          className="object-contain"
        />
        Continue with Google
      </Button>
    </div>
  );
};

export default SocialAuthForm;
