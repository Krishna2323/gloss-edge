import { Button } from "@/components/ui/button";
import Link from "next/link";
import LoginAsBusiness from "@/components/auth/LoginAsBusiness";
import { auth } from "@/auth";

const Home = async () => {
  const session = await auth();
  return (
    <>
      {!session?.user.role || session.user.role === "user" ? (
        <section className="flex">
          <LoginAsBusiness text="Only business accounts can see the inventory." />
        </section>
      ) : (
        <section className="mt-10 flex flex-col-reverse items-center justify-center gap-2 sm:flex-row">
          <Button
            asChild
            className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
          >
            <Link href={"/products"}>View Products</Link>
          </Button>
        </section>
      )}
      {/* <section className="mt-4">
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
            products.length &&
            products.map((product) => (
              <ProductCard key={product._id} question={product} />
            ))}
        </div>
      </section> */}
    </>
  );
};

export default Home;
