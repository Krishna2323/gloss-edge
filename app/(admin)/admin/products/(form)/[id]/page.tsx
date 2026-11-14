import { redirect } from "next/navigation";
import { RouteParams } from "@/types/global";

const page = async ({ params }: RouteParams) => {
  const { id } = await params;
  redirect(`/products/${id}/edit`);
};

export default page;
