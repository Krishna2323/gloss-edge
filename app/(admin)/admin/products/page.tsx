import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      <Link href={"/admin/products/add"}>Add Products</Link>
    </div>
  );
};

export default page;
