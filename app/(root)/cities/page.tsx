import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import CityManager from "@/components/stock/CityManager";
import PageHeader from "@/components/stock/PageHeader";
import StatTiles from "@/components/stock/StatTiles";
import { listCities } from "@/lib/actions/location.actions";
import { isAdmin } from "@/lib/utils";

const CitiesPage = async () => {
  const session = await auth();
  if (!isAdmin(session?.user.role)) {
    return <InfoText text="Only admins can manage cities." />;
  }

  const { success, data, error } = await listCities();
  const cities = data ?? [];
  const active = cities.filter((c) => c.active);

  return (
    <>
      <PageHeader title="Cities" />

      <StatTiles
        tiles={[
          {
            label: "UNITS",
            value: active.reduce((s, c) => s + c.units, 0).toLocaleString("en-IN"),
          },
          { label: "CITIES", value: active.length },
          {
            label: "LOW",
            value: active.reduce((s, c) => s + c.low, 0),
            tone: "low",
          },
        ]}
      />

      {success ? (
        <CityManager cities={cities} />
      ) : (
        <p className="mx-4 mt-7 rounded-3xl border border-out/30 bg-out/10 p-5 text-sm text-out">
          {error?.message ?? "Could not load cities."}
        </p>
      )}
    </>
  );
};

export default CitiesPage;
