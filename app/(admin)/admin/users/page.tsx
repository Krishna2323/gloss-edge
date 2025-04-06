import { auth } from "@/auth";
import UsersTable from "@/components/admin/UsersTable";
import InfoText from "@/components/auth/InfoText";
import { getUsers } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/utils";

const page = async () => {
  const session = await auth();

  if (!session?.user.role || !isAdmin(session?.user.role)) {
    return <InfoText text="Only admin accounts can see the inventory." />;
  }

  const { data } = await getUsers();

  const { users = [], totalUsers } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="h2-bold text-dark100_light900">
          Total User: {totalUsers}
        </h1>
      </section>
      <section>
        <UsersTable data={users} />
      </section>
    </>
  );
};

export default page;
