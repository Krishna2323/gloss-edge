import Image from "next/image";
import { ReactNode } from "react";

import SocialAuthForm from "@/components/forms/SocialAuthForm";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-ink-950 font-archivo text-fg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-44 h-[360px] w-[420px] bg-[radial-gradient(ellipse_at_center,rgba(245,196,81,0.13),rgba(245,196,81,0)_65%)]"
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col px-5 pb-12 pt-14">
        <div className="flex items-center gap-3.5">
          <Image
            src="/images/site-logo.png"
            alt="GlossEdge logo"
            width={48}
            height={48}
            className="size-12 rounded-[14px] object-contain"
          />
          <div className="flex flex-col gap-1">
            <span className="font-wide text-lg font-black uppercase leading-none tracking-tight">
              Gloss Edge
            </span>
            <span className="text-xs text-fg-muted">Stock across cities</span>
          </div>
        </div>
        {children}
        <SocialAuthForm />
      </div>
    </main>
  );
};

export default AuthLayout;
