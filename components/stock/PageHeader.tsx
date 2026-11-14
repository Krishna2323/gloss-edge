import { auth, signOut } from "@/auth";
import { isAdmin } from "@/lib/utils";
import AccountMenu from "./AccountMenu";

const PageHeader = async ({ title }: { title: string }) => {
  const session = await auth();

  return (
    <header className="flex items-center justify-between px-5">
      <h1 className="font-wide text-[34px] font-black uppercase leading-none tracking-tight">
        {title}
      </h1>
      {session?.user && (
        <AccountMenu
          name={session.user.name ?? "Account"}
          email={session.user.email}
          role={session.user.role}
          links={
            isAdmin(session.user.role)
              ? [{ href: "/users", label: "Users" }]
              : undefined
          }
          signOutAction={async () => {
            "use server";

            await signOut({ redirectTo: "/sign-in" });
          }}
        />
      )}
    </header>
  );
};

export default PageHeader;
