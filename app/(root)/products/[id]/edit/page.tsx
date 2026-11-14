import { notFound } from "next/navigation";
import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import ProductForm from "@/components/stock/ProductForm";
import {
  getProduct,
  getProductFormOptions,
} from "@/lib/actions/product.actions";
import { isAdmin } from "@/lib/utils";
import { RouteParams } from "@/types/global";

const EditProductPage = async ({ params }: RouteParams) => {
  const session = await auth();
  if (!isAdmin(session?.user.role)) {
    return <InfoText text="Only admins can edit products." />;
  }

  const { id } = await params;
  const [product, options] = await Promise.all([
    getProduct({ productID: id }),
    getProductFormOptions(),
  ]);
  if (!product.data) notFound();
  if (!options.data) {
    return (
      <InfoText text={options.error?.message ?? "Could not load the form."} />
    );
  }

  const p = product.data;
  return (
    <ProductForm
      options={options.data}
      product={{
        _id: p._id,
        code: p.code,
        title: p.title,
        brand: p.brand,
        description: p.description,
        categories: p.categories.map((c) => c.name),
        color: p.color,
        lowStockAt: p.lowStockAt,
        units: p.stock,
      }}
    />
  );
};

export default EditProductPage;
