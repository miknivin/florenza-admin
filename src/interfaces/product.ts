export interface Product {
  stock?: number;
  actualPrice?: number;
  _id?: any;
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  features: string[];
  variants: Array<{
    size: "12ml" | "20ml"|"30ml" | "50ml" | "100ml" | "150ml";
    price: number;
    discountPrice: number | null;
    imageUrl?: string[] | [];
  }>;
  stockQuantity: number;
  fragranceNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  gender: "Unisex" | "Male" | "Female";
  category:
    | "Floral"
    | "Woody"
    | "Citrus"
    | "Oriental"
    | "Fresh"
    | "Spicy"
    | "Aquatic"
    | "Gourmand";
  images: Array<{ _id?: string; url: string; alt: string }>;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}
