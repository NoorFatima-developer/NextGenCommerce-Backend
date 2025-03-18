import Joi from "joi";

// ProductSchema
export const productSchema = Joi.object({
    name: Joi.string().min(6).max(100).messages({
        "string.base": "Product name must be a string.",
        "string.min": "Product name must be at least 6 characters long.",
        "string.max": "Product name cannot exceed 100 characters.",
    }),
    description: Joi.string().min(10).max(2000).messages({
        "string.base": "Description must be a string.",
        "string.min": "Description must be at least 10 characters long.",
        "string.max": "Description cannot exceed 2000 characters.",
    }),
    price: Joi.number().min(1).max(1000000).messages({
        "number.base": "Price must be a number.",
        "number.min": "Price must be at least 1.",
        "number.max": "Price cannot exceed 1,000,000.",
    }),
    stock: Joi.number().integer().min(0).max(10000).messages({
        "number.base": "Stock must be a number.",
        "number.min": "Stock cannot be negative.",
        "number.max": "Stock cannot exceed 10,000 units.",
    }),
    category: Joi.string().min(3).max(50).messages({
        "string.base": "Category must be a string.",
        "string.min": "Category must be at least 3 characters long.",
        "string.max": "Category cannot exceed 50 characters.",
    }),
}).min(1).messages({
    "object.min": "At least one field is required to update the product.",
});

// Review Schema
export const reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
        "number.base": "Rating must be a number.",
        "number.min": "Rating must be at least 1.",
        "number.max": "Rating cannot be more than 5.",
        "any.required": "Rating is required.",
    }),
    comment: Joi.string().min(5).max(500).required().messages({
        "string.base": "Comment must be a string.",
        "string.empty": "Comment is required.",
        "string.min": "Comment must be at least 5 characters long.",
        "string.max": "Comment cannot exceed 500 characters.",
    }),
});
