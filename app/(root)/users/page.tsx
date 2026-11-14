import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import FilterChips from "@/components/stock/FilterChips";
import PageHeader from "@/components/stock/PageHeader";
import SearchField from "@/components/stock/SearchField";
import StatTiles from "@/components/stock/StatTiles";
import UserManager from "@/components/stock/UserManager";
import { getUsers } from "@/lib/actions/user.actions";
import { buildHref } from "@/lib/url";
import { isAdmin } from "@/lib/utils";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

const FILTERS = [
  { value: "", label: "All" },
  { value: "user", label: "No access" },
  { value: "business", label: "Business" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
] as const;

const UsersPage = async ({ searchParams }: Props) => {
  const session = await auth();
  if (!isAdmin(session?.user.role)) {
    return <InfoText text="Only admins can manage users." />;
  }

  const params = await searchParams;
  const role = FILTERS.find((f) => f.value === params.role)?.value ?? "";
  const query = params.query ?? "";
  const term = query.trim().toLowerCase();

  const { success, data, error } = await getUsers();
  const users = data ?? [];
  const shown = users.filter(
    (u) =>
      (!role || u.role === role) &&
      (!term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term))
  );
  const count = (r: string) => users.filter((u) => u.role === r).length;

  return (
    <>
      <PageHeader title="Users" />

      <StatTiles
        tiles={[
          { label: "USERS", value: users.length },
          {
            label: "WAITING",
            value: count("user"),
            tone: count("user") ? "low" : undefined,
            href: buildHref("/users", { role: "user" }),
          },
          {
            label: "STAFF",
            value: count("staff"),
            href: buildHref("/users", { role: "staff" }),
          },
        ]}
      />

      <div className="flex px-5 pt-7">
        <SearchField placeholder="Name or email" />
      </div>

      <FilterChips
        chips={FILTERS.map((f) => ({
          label: f.label,
          href: buildHref("/users", { query, role: f.value }),
          active: role === f.value,
        }))}
      />

      <div className="flex justify-between px-6 pb-3.5 pt-8 text-[11px] font-semibold tracking-widest text-fg-faint">
        <span>
          {shown.length} {shown.length === 1 ? "USER" : "USERS"}
        </span>
        <span>ACCESS</span>
      </div>

      {success ? (
        <UserManager users={shown} />
      ) : (
        <p className="mx-4 rounded-3xl border border-out/30 bg-out/10 p-5 text-sm text-out">
          {error?.message ?? "Could not load users."}
        </p>
      )}
    </>
  );
};

export default UsersPage;
