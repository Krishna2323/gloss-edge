import { UserRole } from "@/types/nextauth";

export const PRODUCTS_PER_PAGE = 20;

export const getSidebarLinks = (role: UserRole | undefined) => [
  {
    imgURL: "/icons/home.svg",
    route: "/",
    label: "Home",
  },
  ...(role === "admin"
    ? [
        {
          imgURL: "/icons/dashboard.svg",
          route: "/admin",
          label: "Dashboard",
        },
        {
          imgURL: "/icons/user.svg",
          route: "/admin/users",
          label: "Users",
        },
        {
          imgURL: "/icons/list.svg",
          route: "/admin/products",
          label: "Products",
        },
        {
          imgURL: "/icons/category.svg",
          route: "/admin/categories",
          label: "Categories",
        },
      ]
    : []),
];

export const adminSidebarLinks = [
  {
    imgURL: "/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/icons/dashboard.svg",
    route: "/admin",
    label: "Dashboard",
  },
  {
    imgURL: "/icons/user.svg",
    route: "/admin/users",
    label: "Users",
  },
  {
    imgURL: "/icons/list.svg",
    route: "/admin/products",
    label: "Products",
  },
  {
    imgURL: "/icons/category.svg",
    route: "/admin/categories",
    label: "Categories",
  },
];
