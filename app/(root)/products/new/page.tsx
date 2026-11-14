import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import ProductForm from "@/components/stock/ProductForm";
import { getProductFormOptions } from "@/lib/actions/product.actions";
import { isAdmin } from "@/lib/utils";

const NewProductPage = async () => {
  const session = await auth();
  if (!isAdmin(session?.user.role)) {
    return <InfoText text="Only admins can add products." />;
  }

  const { data, error } = await getProductFormOptions();
  if (!data) {
    return <InfoText text={error?.message ?? "Could not load the form."} />;
  }

  return <ProductForm options={data} />;
};

export default NewProductPage;
