import React from "react";

const ProductDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  return <div>Product Page: {id}</div>;
};

export default ProductDetails;
