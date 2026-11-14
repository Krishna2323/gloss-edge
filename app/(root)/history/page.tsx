import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import CityPicker from "@/components/stock/CityPicker";
import FilterChips from "@/components/stock/FilterChips";
import MovementList from "@/components/stock/MovementList";
import PageHeader from "@/components/stock/PageHeader";
import PageNav from "@/components/stock/PageNav";
import SearchField from "@/components/stock/SearchField";
import { getHistory } from "@/lib/actions/history.actions";
import { listCities } from "@/lib/actions/location.actions";
import type { ProductMovement } from "@/lib/actions/stock.actions";
import { buildHref } from "@/lib/url";
import { formatDay, formatTime, isAdmin } from "@/lib/utils";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

const KINDS = [
  { value: "", label: "All" },
  { value: "in", label: "In" },
  { value: "out", label: "Out" },
  { value: "move", label: "Moves" },
  { value: "edit", label: "Edits" },
] as const;

const byDay = (entries: ProductMovement[]) => {
  const groups: { day: string; entries: ProductMovement[] }[] = [];
  for (const entry of entries) {
    const day = formatDay(entry.at);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.entries.push(entry);
    else groups.push({ day, entries: [entry] });
  }
  return groups;
};

const HistoryPage = async ({ searchParams }: Props) => {
  const session = await auth();
  if (!isAdmin(session?.user.role)) {
    return <InfoText text="Only admins can see the history." />;
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const city = params.city ?? "";
  const kind =
    KINDS.find((k) => k.value === params.kind && !(city && k.value === "edit"))
      ?.value ?? "";
  const query = params.query ?? "";

  const [history, cities] = await Promise.all([
    getHistory({ page, query, kind, city }),
    listCities(),
  ]);
  const activeCities = (cities.data ?? []).filter((c) => c.active);
  const entries = history.data?.entries ?? [];

  const href = (changes: Record<string, string | number | undefined>) =>
    buildHref("/history", { query, kind, city, page, ...changes });

  return (
    <>
      <PageHeader title="History" />

      <div className="flex gap-2.5 px-5 pt-7">
        <SearchField placeholder="Product code or name" />
        {activeCities.length > 0 && (
          <CityPicker
            cities={activeCities}
            selectedId={city}
            manageHref="/cities"
          />
        )}
      </div>

      <FilterChips
        chips={KINDS.filter((k) => !(city && k.value === "edit")).map((k) => ({
          label: k.label,
          href: href({ kind: k.value, page: 1 }),
          active: kind === k.value,
        }))}
      />

      {!history.success ? (
        <p className="mx-4 mt-8 rounded-3xl border border-out/30 bg-out/10 p-5 text-sm text-out">
          {history.error?.message ?? "Could not load history."}
        </p>
      ) : entries.length === 0 ? (
        <p className="mx-4 mt-8 rounded-3xl border border-white/[0.06] bg-ink-900 p-8 text-center text-sm text-fg-muted">
          {query || kind || city ? "Nothing matches." : "Nothing here yet."}
        </p>
      ) : (
        byDay(entries).map(({ day, entries }) => (
          <section key={day}>
            <h2 className="px-6 pb-3.5 pt-8 text-[11px] font-semibold uppercase tracking-widest text-fg-faint">
              {day}
            </h2>
            <MovementList movements={entries} when={formatTime} />
          </section>
        ))
      )}

      <PageNav
        page={page}
        prevHref={page > 1 ? href({ page: page - 1 }) : undefined}
        nextHref={history.data?.isNext ? href({ page: page + 1 }) : undefined}
      />
    </>
  );
};

export default HistoryPage;
