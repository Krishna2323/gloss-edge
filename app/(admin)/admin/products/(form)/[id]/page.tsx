import AddEditProductForm from "@/components/admin/AddEditProductForm";
import { getProduct } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import React from "react";

const page = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();

  const { data: product, success } = await getProduct({ productID: id });
  if (!success) return notFound();

  return (
    <div>
      <AddEditProductForm isEditAction product={product} />
    </div>
  );
};

export default page;
