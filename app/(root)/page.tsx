// import { auth } from "@/auth";
import LocalSearch from "@/components/search/LocalSearch";
import HomeFilter from "@/components/filters/HomeFilter";
import ProductCard from "@/components/cards/ProductCard";
import handleError from "@/lib/handlers/error";
import { api } from "@/lib/api";

const products = [
  {
    _id: "2",
    brand: "LuxePanel",
    title: "Glossy White Self Adhesive Acrylic",
    description:
      "High-quality glossy white acrylic sheet with strong adhesive backing.",
    categories: [
      { _id: "1", name: "Acrylic" },
      { _id: "3", name: "Interior Design" },
    ],
    createdAt: new Date("2022-05-15"),
    code: "LP-101",
    stock: 15,
  },
  {
    _id: "3",
    brand: "Reflecto",
    title: "Mirror Finish Acrylic Sheet",
    description:
      "Premium mirror-finish acrylic sheet, perfect for decor and furniture applications.",
    categories: [
      { _id: "1", name: "Acrylic" },
      { _id: "2", name: "Furniture Decor" },
      { _id: "4", name: "Wall Panels" },
    ],
    createdAt: new Date("2023-02-10"),
    code: "RF-502",
    stock: 10,
  },
  {
    _id: "4",
    brand: "GlossEdge",
    title: "Frosted Blue Acrylic Sheet",
    description: "Elegant frosted blue acrylic for a modern look.",
    categories: [
      { _id: "1", name: "Acrylic" },
      { _id: "5", name: "Kitchen Decor" },
    ],
    createdAt: new Date("2023-08-21"),
    code: "GE-305",
    stock: 30,
  },
  {
    _id: "5",
    brand: "DecoPanel",
    title: "Textured Black Acrylic Panel",
    description:
      "Scratch-resistant, textured black acrylic panel suitable for furniture and interiors.",
    categories: [
      { _id: "1", name: "Acrylic" },
      { _id: "2", name: "Furniture Decor" },
      { _id: "6", name: "Commercial Interiors" },
    ],
    createdAt: new Date("2024-01-05"),
    code: "DP-707",
    stock: 18,
  },
  {
    _id: "6",
    brand: "Acrylux",
    title: "Transparent Acrylic Sheet",
    description: "Crystal-clear acrylic sheet for various applications.",
    categories: [
      { _id: "1", name: "Acrylic" },
      { _id: "7", name: "Signage" },
    ],
    createdAt: new Date("2024-02-18"),
    code: "AX-900",
    stock: 25,
  },
];

const test = async () => {
  try {
    return await api.users.getAll();
  } catch (error) {
    return handleError(error);
  }
};

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
  const users = await test();

  console.log(users);
  const { query = "", filter = "" } = await searchParams;
  // const session = await auth();

  const filteredQuestions = products.filter((product) => {
    const matchesQuery =
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.code.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter
      ? // ? question.category[0].name.toLowerCase() === filter.toLowerCase()
        product.categories.some(
          (c) => c.name.toLowerCase() === filter.toLowerCase()
        )
      : true;
    return matchesQuery && matchesFilter;
  });

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
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => (
          <ProductCard key={question._id} question={question} />
        ))}
      </div>{" "}
    </>
  );
};

export default Home;
