import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    description: {
      type: String,
      required: [true, "Please enter Description"],
      minlength: [10, "Description must be at least 10 characters long."],
      maxlength: [2000, "Description cannot exceed 2000 characters."]
    },
    
    photo: {
      type: String,
      required: [true, "Please enter Photo"],
    },

    price: {
      type: Number,
      required: [true, "Please enter Price"],
    },

    stock: {
      type: Number,
      required: [true, "Please enter Stock"],
    },

    category: {
        type: String,
        required: [true, "Please enter Category"],
        trim: true
        // enum: ["Electronics", "Clothing", "Books", "Furniture"]
    },

    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    averageRating: { type: Number, default: 0 }
  },
  { 
    timestamps: true
  },
  
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;