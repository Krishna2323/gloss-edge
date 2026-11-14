interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
    // role: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface ProductFieldsParams {
  brand: string;
  title: string;
  description: string;
  categories: string[];
  code: string;
  color?: string;
  lowStockAt?: number;
}

interface CreateProductParams extends ProductFieldsParams {
  startingStock: number;
  locationID?: string;
}

interface EditProductParams extends ProductFieldsParams {
  productID: string;
  remark?: string;
}

interface GetProductParams {
  productID: string;
}

interface AdjustStockParams {
  productID: string;
  locationID: string;
  type: "in" | "out" | "correction";
  change: number;
  reason?: string;
  note?: string;
}

interface TransferStockParams {
  productID: string;
  fromLocationID: string;
  toLocationID: string;
  quantity: number;
  note?: string;
}

interface CreateCityParams {
  name: string;
  state?: string;
}

interface UpdateCityParams extends CreateCityParams {
  locationID: string;
}
