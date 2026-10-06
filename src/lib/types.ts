export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_minor: number;
  currency: string;
  category: "Templates" | "Books" | "Wallpapers";
  cover_path: string;
};

export const CATEGORIES = ["All", "Templates", "Books", "Wallpapers"] as const;
