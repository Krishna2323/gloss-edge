const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  PROFILE: (id: string) => `/profile/${id}`,
  PRODUCT: (id: string) => `/products/${id}`,
  TAGS: (id: string) => `/tags/${id}`,
};

export default ROUTES;
