interface Category {
  _id: string;
  name: string;
}

interface Author {
  _id: string;
  name: string;
  image: string;
}

interface Product {
  _id: string;
  brand: string;
  title: string;
  description: string;
  categories: Category[];
  createdAt: Date;
  stock: number;
  code: string;
}
