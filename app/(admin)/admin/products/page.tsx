import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col">
      <Button
        asChild
        className="primary-gradient paragraph-medium min-h-12 w-full max-w-64 rounded-2 px-4 py-3 font-inter !text-light-900"
      >
        <Link href={"/admin/products/add"}>Add Products</Link>
      </Button>
      <Button
        asChild
        className="primary-gradient paragraph-medium mt-8 min-h-12 w-full max-w-64  rounded-2 px-4 py-3 font-inter !text-light-900"
      >
        <Link href={"/admin/products/history"}>Product Edit History</Link>
      </Button>
    </div>
  );
};

export default page;
