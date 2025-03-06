import { Button } from "@/components/ui/button";
import Link from "next/link";
import LoginAsBusiness from "@/components/auth/LoginAsBusiness";
import { auth } from "@/auth";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

const Home = async () => {
  const session = await auth();
  return (
    <>
      {!session?.user.role || session.user.role === "user" ? (
        <section className="gap-10">
          <LoginAsBusiness text="Only business accounts can see the inventory." />
          <div className="flex flex-col gap-3">
            <Button
              className="body-bold btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_IN}>
                <Image
                  src="/icons/sign-in.svg"
                  alt="Account"
                  width={24}
                  height={24}
                  className="invert-colors"
                />
                <span className=" ">Log In</span>
              </Link>
            </Button>

            <Button
              className="body-bold light-border-2 btn text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_UP}>
                <Image
                  src="/icons/sign-up.svg"
                  alt="Account"
                  width={24}
                  height={24}
                  className="invert-colors"
                />
                <span className="primary-text-gradient">Sign Up</span>
              </Link>
            </Button>
          </div>
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
