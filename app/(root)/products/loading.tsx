import { Skeleton } from "@/components/ui/skeleton";

const ProductsLoading = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
      {[...Array(8)].map((_, i) => (
        <Skeleton
          key={i}
          className="background-light800_darkgradient h-[200px] rounded-xl"
        />
      ))}
    </div>
  );
};

const Loading = () => {
  return (
    <div className="flex w-full flex-col space-y-6">
      {/* Header Skeleton */}
      <Skeleton className="background-light800_darkgradient h-10 w-1/5 rounded-lg" />

      {/* Search & Filters Skeleton */}
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="background-light800_darkgradient h-14 w-full rounded-lg" />
        <div className="mt-6 flex w-full flex-wrap gap-3 sm:flex">
          <Skeleton className="background-light800_darkgradient h-10 w-1/6 rounded-lg" />
          <Skeleton className="background-light800_darkgradient h-10 w-1/6 rounded-lg" />
          <Skeleton className="background-light800_darkgradient h-10 w-1/6 rounded-lg" />
          <Skeleton className="background-light800_darkgradient h-10 w-1/6 rounded-lg" />
        </div>
      </div>

      <Skeleton className="background-light800_darkgradient mb-4 mt-6 h-8 w-1/3 rounded-lg p-2" />
      {/* Products Grid Skeleton */}
      <ProductsLoading />
    </div>
  );
};

export default Loading;
export { ProductsLoading };
