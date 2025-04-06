import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import ProductCard from "@/components/cards/ProductCard";
import HomeFilter from "@/components/filters/HomeFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { PRODUCTS_PER_PAGE } from "@/constants";
import { getProducts } from "@/lib/actions/product.actions";
import React, { Suspense } from "react";
import { ProductsLoading } from "./loading";
import { isAdmin } from "@/lib/utils";
import Heading from "@/components/Heading";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const page = async ({ searchParams }: SearchParams) => {
  const { page = 1, pageSize, query, filter } = await searchParams;
  const session = await auth();

  if (
    (!session?.user.role || session.user.role === "user") &&
    !isAdmin(session?.user.role)
  ) {
    return <InfoText text="Only business accounts can see the inventory." />;
  }
  const { data } = await getProducts({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || PRODUCTS_PER_PAGE,
    query: query || "",
    filter: filter || "",
  });

  const { products = [], isNext, totalProducts } = data || {};

  return (
    <>
      <Heading text="All Products " />
      <LocalSearch
        route="/"
        imgSrc="/icons/search_coloured.svg"
        placeholder="Search products..."
        otherClasses="flex-1"
      />
      <HomeFilter />
      <Suspense fallback={<ProductsLoading />}>
        <h3 className="text-dark100_light900 mt-6 p-2 text-lg">
          {!!products?.length &&
            `Showing ${PRODUCTS_PER_PAGE * Number(page)} out of ${totalProducts} results.`}
        </h3>
        <section>
          <div className="mt-4 flex w-full flex-wrap gap-6">
            {products &&
              products.length > 0 &&
              products.map((product) => (
                <ProductCard key={product._id} question={product} />
              ))}

            {products && !products.length && (
              <InfoText
                text={
                  query || filter ? "No results found!" : "No products to show"
                }
              />
            )}
          </div>
        </section>
      </Suspense>
      {products && products.length > 0 && (
        <Pagination page={page} isNext={isNext || false} />
      )}
    </>
  );
};

export default page;
