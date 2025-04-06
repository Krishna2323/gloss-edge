import { auth } from "@/auth";
import ProductsHistoryTable from "@/components/admin/ProductsHistoryTable";
import InfoText from "@/components/auth/InfoText";
import { getProductsHistory } from "@/lib/actions/product.actions";
import { isAdmin } from "@/lib/utils";
import React from "react";

const page = async () => {
  const session = await auth();

  if (!session?.user.role || !isAdmin(session?.user.role)) {
    return <InfoText text="Only admin accounts can see the inventory." />;
  }

  const { data } = await getProductsHistory();

  console.log(data);

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="h2-bold text-dark100_light900">Products History</h1>
      </section>
      <section>
        <ProductsHistoryTable data={data?.productHistories ?? []} />
      </section>
    </>
  );
};

export default page;
