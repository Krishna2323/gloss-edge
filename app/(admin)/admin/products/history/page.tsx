import { auth } from "@/auth";
import ProductsHistoryTable from "@/components/admin/ProductsHistoryTable";
import InfoText from "@/components/auth/InfoText";
import { getProductsHistory } from "@/lib/actions/product.actions";
import { isAdmin } from "@/lib/utils";
import React from "react";
import HistoryDateFilter from "@/components/admin/HistoryDateFilter";
import Pagination from "@/components/Pagination";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const session = await auth();

  if (!session?.user.role || !isAdmin(session?.user.role)) {
    return <InfoText text="Only admin accounts can see the inventory." />;
  }

  const query = await searchParams;
  const pageParam = Number(query.page || 1);
  const pageSizeParam = Number(query.pageSize || 20);
  const from = query.from;
  const to = query.to;

  const { data } = await getProductsHistory({
    page: pageParam,
    pageSize: pageSizeParam,
    from,
    to,
  });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="h2-bold text-dark100_light900">Products History</h1>
      </section>
      <section className="mt-4">
        <HistoryDateFilter />
      </section>
      <section>
        <ProductsHistoryTable data={data?.productHistories ?? []} />
      </section>
      <section>
        <Pagination isNext={Boolean(data?.isNext)} page={pageParam} />
      </section>
    </>
  );
};

export default page;
