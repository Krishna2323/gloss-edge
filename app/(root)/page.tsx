import LocalSearch from "@/components/search/LocalSearch";
import HomeFilter from "@/components/filters/HomeFilter";
import ProductCard from "@/components/cards/ProductCard";
import { getProducts } from "@/lib/actions/product.actions";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getProducts({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 50,
    query: query || "",
    filter: filter || "",
  });

  const { products } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Products</h1>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search products..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-wrap gap-6">
        {products &&
          products.length &&
          products.map((product) => (
            <ProductCard key={product._id} question={product} />
          ))}
      </div>{" "}
    </>
  );
};

export default Home;
