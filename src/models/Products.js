import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // For efficient search by name
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g., "COCO"
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: [230, "Short description cannot exceed 230 characters"],
    },
    features: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (features) => features.length <= 20,
        message: "Maximum 20 features allowed",
      },
      default: [],
    },
    variants: [
      {
        size: {
          type: String,
          required: true,
          enum: ["12ml","20ml", "30ml", "50ml", "100ml", "150ml"], // Restrict to common perfume sizes
          
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPrice: {
          type: Number,
          min: 0,
          default: null,
        },
         imageUrl: {
         type: [{ type: String }],
         default: [], // Allow null for variants without specific images
        },
      },
    ],
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    fragranceNotes: {
      top: [{ type: String, trim: true }], // e.g., ["Bergamot", "Lemon"]
      heart: [{ type: String, trim: true }], // e.g., ["Jasmine", "Rose"]
      base: [{ type: String, trim: true }], // e.g., ["Sandalwood", "Musk"]
    },
    gender: {
      type: String,
      enum: ["Unisex", "Male", "Female"],
      default: "Unisex",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Floral",
        "Woody",
        "Citrus",
        "Oriental",
        "Fresh",
        "Spicy",
        "Aquatic",
        "Gourmand",
        "Combo",
      ],
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        ratings: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
