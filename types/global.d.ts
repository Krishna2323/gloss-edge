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
  quantity: number;
  category: Category[];
  createdAt: Date;
  model: string;
  // tags: Tag[];
  // author: Author;
  // upvotes: number;
  // answers: number;
  // views: number;
}
