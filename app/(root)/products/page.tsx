import { auth } from "@/auth";
import LoginAsBusiness from "@/components/auth/LoginAsBusiness";
import ProductCard from "@/components/cards/ProductCard";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { getProducts } from "@/lib/actions/product.actions";
import React from "react";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const page = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const session = await auth();

  if (!session?.user.role || session.user.role === "user") {
    return (
      <LoginAsBusiness text="Only business accounts can see the inventory." />
    );
  }
  const { data } = await getProducts({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 50,
    query: query || "",
    filter: filter || "",
  });

  const { products = [] } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="h2-bold text-dark100_light900">All Products</h1>
      </section>
      <section className="mt-4">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search products..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <section>
        <div className="mt-10 flex w-full flex-wrap gap-6">
          {products &&
            products.length > 0 &&
            products.map((product) => (
              <ProductCard key={product._id} question={product} />
            ))}

          {products && !products.length ? (
            <LoginAsBusiness
              text={
                query || filter ? "No results found!" : "No products to show"
              }
            />
          ) : (
            <LoginAsBusiness text="Only business accounts can see the inventory." />
          )}
        </div>
      </section>
    </>
  );
};

export default page;
