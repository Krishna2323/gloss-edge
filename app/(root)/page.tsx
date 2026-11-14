import Link from "next/link";
import { auth, signOut } from "@/auth";
import CityOverview from "@/components/stock/CityOverview";
import MovementList from "@/components/stock/MovementList";
import PageHeader from "@/components/stock/PageHeader";
import ProductRow from "@/components/stock/ProductRow";
import SectionHeading from "@/components/stock/SectionHeading";
import StatTiles from "@/components/stock/StatTiles";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  getRecentMovements,
  getStockOverview,
} from "@/lib/actions/stock.actions";
import { canSeeCityStock, canSeeInventory, isAdmin } from "@/lib/utils";

const greeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const NoAccess = ({ signedIn }: { signedIn: boolean }) => (
  <section className="mx-5 mt-10 flex flex-col gap-6 rounded-3xl border border-white/[0.06] bg-ink-900 p-7">
    <p className="font-wide text-xl font-black uppercase leading-tight">
      {signedIn
        ? "Only business accounts can see the inventory."
        : "Sign in to see the stock."}
    </p>
    {signedIn ? (
      <form
        action={async () => {
          "use server";

          await signOut({ redirectTo: ROUTES.SIGN_IN });
        }}
      >
        <Button type="submit" variant="raised" size="tap" className="w-full">
          Sign out
        </Button>
      </form>
    ) : (
      <div className="flex flex-col gap-3">
        <Button asChild variant="gold" size="tap">
          <Link href={ROUTES.SIGN_IN}>Sign in</Link>
        </Button>
        <Button asChild variant="raised" size="tap">
          <Link href={ROUTES.SIGN_UP}>Create account</Link>
        </Button>
      </div>
    )}
  </section>
);

const Home = async () => {
  const session = await auth();
  const role = session?.user.role;
  if (!canSeeInventory(role)) return <NoAccess signedIn={!!role} />;

  const showCities = canSeeCityStock(role);
  const [overview, recent] = await Promise.all([
    getStockOverview({ filter: "low", pageSize: 5 }),
    showCities ? getRecentMovements() : null,
  ]);

  const counts = overview.data?.counts ?? {
    units: 0,
    low: 0,
    out: 0,
    products: 0,
  };
  const locations = overview.data?.locations ?? [];
  const firstName = session?.user.name?.split(" ")[0];

  return (
    <>
      <p className="px-5 pb-2 text-[13px] font-semibold text-fg-muted">
        {greeting()}
        {firstName ? `, ${firstName}` : ""}
      </p>
      <PageHeader title="Home" />

      {!overview.success && (
        <p className="mx-4 mt-7 rounded-3xl border border-out/30 bg-out/10 p-5 text-sm text-out">
          {overview.error?.message ?? "Could not load stock."}
        </p>
      )}

      <StatTiles
        tiles={[
          {
            label: "UNITS",
            value: counts.units.toLocaleString("en-IN"),
            href: "/products",
          },
          {
            label: "LOW",
            value: counts.low,
            tone: "low",
            href: "/products?filter=low",
          },
          {
            label: "OUT",
            value: counts.out,
            tone: "out",
            href: "/products?filter=out",
          },
        ]}
      />

      {!showCities && (
        <div className="px-5 pt-7">
          <Button asChild variant="gold" size="tap" className="w-full">
            <Link href="/products">Browse stock</Link>
          </Button>
        </div>
      )}

      {showCities && locations.length > 0 && (
        <>
          <SectionHeading
            action={
              isAdmin(role) ? { href: "/cities", label: "Manage" } : undefined
            }
          >
            Cities
          </SectionHeading>
          <CityOverview cities={locations} />
        </>
      )}

      {showCities && overview.data && overview.data.products.length > 0 && (
        <>
          <SectionHeading
            action={{ href: "/products?filter=low", label: "See all" }}
          >
            Running low
          </SectionHeading>
          <div className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
            {overview.data.products.map((product) => (
              <ProductRow key={product._id} product={product} cityIndex={-1} />
            ))}
          </div>
        </>
      )}

      {recent?.data && (
        <>
          <SectionHeading>Latest</SectionHeading>
          <MovementList movements={recent.data} />
        </>
      )}
    </>
  );
};

export default Home;
