import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  prevHref?: string;
  nextHref?: string;
}

const PageNav = ({ page, prevHref, nextHref }: Props) => {
  if (!prevHref && !nextHref) return null;

  const button = cn(
    buttonVariants({ variant: "raised", size: "tap-icon" }),
    "rounded-2xl"
  );

  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-center gap-4 px-5 pt-8"
    >
      {prevHref ? (
        <Link href={prevHref} className={button} aria-label="Previous page">
          <ChevronLeft />
        </Link>
      ) : (
        <span className="size-11" />
      )}
      <span className="font-wide min-w-12 text-center text-sm font-extrabold tabular-nums">
        {page}
      </span>
      {nextHref ? (
        <Link href={nextHref} className={button} aria-label="Next page">
          <ChevronRight />
        </Link>
      ) : (
        <span className="size-11" />
      )}
    </nav>
  );
};

export default PageNav;
