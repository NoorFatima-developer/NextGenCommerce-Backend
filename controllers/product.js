import { asyncRequestHandler } from "../utils/asyncHandler.js";
import Product from "../models/product.js";
import ErrorHandler from "../middlewares/error.js";
import fs from "fs";
import { myCache } from "../app.js";
import { calculateAverageRating, invalidateCache } from "../utils/features.js";
import {
  productSchema,
  reviewSchema,
} from "../validationSchemas/productValidationSchema.js";
// import { faker } from '@faker-js/faker';

//Get Latest products...
//Revalidate on New, Update, Delete Product...
export const getlatestProducts = asyncRequestHandler(async (req, res, next) => {
  let products = [];

  if (myCache.has("latest-product")){
    console.log("Fetching from cache");
    products = JSON.parse(myCache.get("latest-product"));
  }else{
    console.log("Fetching from database");
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    console.log("Products from DB:", products);
    // Store products data in cache memory...
    myCache.set("latest-product", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

//Get All categories
//Revalidate on New, Update, Delete Product...
export const getAllCategories = asyncRequestHandler(async (req, res, next) => {
  const categories = await Product.distinct("category");

  return res.status(201).json({
    success: true,
    categories,
  });
});

// Get Admin Products...
//Revalidate on New, Update, Delete Product...
export const getAdminProducts = asyncRequestHandler(async (req, res, next) => {
  let products;

  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products"));
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(201).json({
    success: true,
    products,
  });
});

// Get Single Product...
export const getSingleProduct = asyncRequestHandler(async (req, res, next) => {
  let product;
  const id = req.params.id;

  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`));
  else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(201).json({
    success: true,
    product,
  });
});

// Create newProduct...
export const newProduct = asyncRequestHandler(async (req, res, next) => {
  const { name, description, price, stock, category } = req.body;
  const photo = req.file;

  const { error } = productSchema
    .fork(["name", "description", "price", "stock", "category"], (schema) =>
      schema.required()
    )
    .validate(req.body);

  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  if (!photo) return next(new ErrorHandler("Please add Photo", 400));

  if (!name || !description || !price || !stock || !category) {
    // photo removed from upload automatically if photo is selected and other fields are not...
    await fs.promises.rm(photo.path, () => {
      console.log("Deleted");
      return next(new ErrorHandler("Please enter all fields", 400));
    });
  }

  const existingProduct = await Product.findOne({ name });
  if(existingProduct){
    fs.rm(photo.path, () => {
      console.log("Deleted");
    });
    return next(new ErrorHandler("Product with this name already exists", 400));
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    photo: photo.path,
  });


  // remove old cache from memory...
  await invalidateCache({ product: true });

  return res.status(201).json({
    success: true,
    message: "Product Creted Successfully",
    product,
  });
});

// Update Product...
export const updateProduct = asyncRequestHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;
  const photo = req.file;

  const { error } = productSchema.min(1).validate(req.body);
  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Invalid Product Id", 400));

  // update photo with new photo...
  if (photo) {
    await fs.promises.rm(product.photo, () => {
      console.log("Deleted");
      product.photo = photo.path;
    });
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  // save all products..
  await product.save();
  await invalidateCache({ product: true, productId: product._id });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

// Delete Product...
export const deleteProduct = asyncRequestHandler(async (req, res, next) => {
  // Get product from id...
  const product = await Product.findById(req.params.id);
  // If product not found...
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  // If Product Found remove photo
  fs.rm(product.photo, () => {
    console.log("Product Photo Deleted");
  });
  // and then delete other products...
  await Product.deleteOne();

  await invalidateCache({ product: true, productId: product._id });

  return res.status(201).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

// To get All products through filter --->Search all products...

export const getAllProducts = asyncRequestHandler(async (req, res, next) => {
  const { search, sort, category, price } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1); //Default value is 1.. and Page must be greater than 1
  const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
  const skip = (page - 1) * limit;

  const baseQuery = {};
  // Apply filters on products while Searching...
  if (search)
    baseQuery.name = {
      // regix means it will find pattern...
      $regex: search,
      $options: "i",
    };

  if (price) {
    baseQuery.price = {
      $lte: Number(price),
    };
  }
  if (category) {
    baseQuery.category = category;
  }

  // Fetching Total Products Count (Without Pagination)
  const totalProducts = await Product.countDocuments(baseQuery);

  // Fetching Paginated Products
  const products = await Product.find(baseQuery)
    .sort(sort && { price: sort === "asc" ? 1 : -1 })
    // How many products show on page..
    .limit(limit)
    // How many products skip..
    .skip(skip);

  const totalPage = Math.ceil(totalProducts / limit);

  return res.status(200).json({
    success: true,
    products,
    totalPage,
  });
});

// Create Review..
export const addReview = asyncRequestHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  // Find product to check if user has already given review to the product..
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product not Found", 404));

  // Check reviews by product id, is user already rated to this product..
  //  .find() b loop ki trhan hi kam krta hai and ye ek hi item return karta hai jisklye condition satisfy kare.
  const alreadyRated = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyRated)
    return next(new ErrorHandler("User has already added a review", 404));

  const review = {
    user: req.user._id,
    rating,
    comment,
  };

  product.reviews.push(review);

  calculateAverageRating(product);
  await product.save();

  res.status(201).json({
    success: true,
    message: "Review Added Successfully.",
  });
});

// Update Review...
export const updateReview = asyncRequestHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  const { rating } = req.body;
  const { comment } = req.body;

  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const review = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (!review)
    return next(new ErrorHandler("You haven't reviewed this product yet", 404));

  review.rating = rating;
  review.comment = comment;

  calculateAverageRating(product);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Review updated Sucessfully.",
  });
});

// Delete Review:
export const deleteReview = asyncRequestHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const reviewExist = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (!reviewExist)
    return next(new ErrorHandler("You haven't reviewed this product yet", 404));

  // Delete reviews using filer...
  // filter() unhi elements ko rakhta hai jinke liye condition true hoti hai...
  // ta k osk elawa baki sary elements ko array m rkhy...
  product.reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString() //if user is is match then return false means delete review..
  );

  calculateAverageRating(product);
  await product.save();

  res.status(201).json({
    success: true,
    message: "Review deleted successfully!",
  });
});

// Generate Random Products...

// const generateRandomProducts = async(count = 10)=>{
//     const products = [];

//     for(let i = 0; i < count; i++){
//         const product = {
//             name: faker.commerce.productName(),
//             photo: "uploads\\0664b56b-1a06-4bb1-9dbc-23c9bb36c9ca.png",
//             price: faker.commerce.price({min: 1500, max:80000, dec:0}),
//             stock: faker.commerce.price({min: 0, max: 100, dec:0}),
//             category: faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             __v: 0,
//         };
//         products.push(product);
//     }

//     await Product.create(products);
//     console.log({success: true});

// }

// generateRandomProducts(40);

// Delete All Products...

// const deleteRandomsProducts = async(count=10)=>{
//     const products = await Product.find({}).skip(2);

//     for(let i = 0; i < products.length; i++) {
//         const product = products[i];
//         await product.deleteOne();
//     }

//     console.log({success: true});

// }

// deleteRandomsProducts(38);
