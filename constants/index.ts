import { UserRole } from "@/types/nextauth";

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

  // ...(role
  //   ? [
  //       {
  //         imgURL: "/icons/list.svg",
  //         route: "/orders",
  //         label: "Orders",
  //       },
  //     ]
  //   : []),
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
  // {
  //   imgURL: "/icons/suitcase.svg",
  //   route: "/jobs",
  //   label: "Find Jobs",
  // },
  // {
  //   imgURL: "/icons/tag.svg",
  //   route: "/tags",
  //   label: "Tags",
  // },
  // {
  //   imgURL: "/icons/user.svg",
  //   route: "/profile",
  //   label: "Profile",
  // },
  // {
  //   imgURL: "/icons/question.svg",
  //   route: "/ask-question",
  //   label: "Ask a question",
  // },
];
