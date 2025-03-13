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

interface CreateProductParams {
  brand: string;
  title: string;
  description: string;
  stock: number;
  categories: string[];
  code: string;
}

interface EditProductParams extends CreateProductParams {
  productID: string;
  remark: string;
}

interface GetProductParams {
  productID: string;
}
