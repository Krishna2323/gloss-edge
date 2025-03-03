import { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import AdminLeftSidebar from "@/components/navigation/AdminLeftSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <AdminLeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
      </div>{" "}
    </main>
  );
};

export default RootLayout;
