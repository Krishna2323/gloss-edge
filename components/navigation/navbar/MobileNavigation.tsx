import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavLinks from "./NavLinks";
import { getSidebarLinks } from "@/constants";
import { auth, signOut } from "@/auth";
import { ROUTES } from "@/constants/routes";

const MobileNavigation = async () => {
  const session = await auth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/icons/menu.svg"
          width={36}
          height={36}
          alt="Menu"
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 h-full overflow-scroll border-none"
      >
        <SheetTitle className="hidden">Navigation</SheetTitle>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/site-logo.png"
            width={42}
            height={42}
            alt="Logo"
          />

          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
            Gloss<span className="text-primary-500">Edge</span>
          </p>
        </Link>

        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-6 pt-16">
              <NavLinks
                isMobileNav
                links={getSidebarLinks(session?.user.role)}
              />
            </section>
          </SheetClose>

          <div className="flex flex-col gap-3">
            {!session?.user?.id ? (
              <>
                <SheetClose asChild>
                  <Link href={ROUTES.SIGN_IN}>
                    <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                      <span className="primary-text-gradient">Log In</span>
                    </Button>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href={ROUTES.SIGN_UP}>
                    <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
                      Sign Up
                    </Button>
                  </Link>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <form
                    action={async () => {
                      "use server";

                      await signOut();
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none"
                      >
                        <span className="primary-text-gradient">Sign out</span>
                      </Button>
                    </div>
                  </form>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
