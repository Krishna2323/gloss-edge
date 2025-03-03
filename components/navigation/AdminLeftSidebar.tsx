import React from "react";
import NavLinks from "./navbar/NavLinks";
import Image from "next/image";
import { Button } from "../ui/button";
import { adminSidebarLinks } from "@/constants";
import { signOut } from "next-auth/react";

const AdminLeftSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks links={adminSidebarLinks} />
      </div>
      <div className="flex flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button
            type="submit"
            className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
          >
            <Image
              src="/icons/sign-up.svg"
              alt="Account"
              width={28}
              height={28}
              className="invert-colors lg:hidden"
            />
            <span className="max-lg:hidden">Sign Out</span>
          </Button>
        </form>
      </div>
    </section>
  );
};

export default AdminLeftSidebar;
