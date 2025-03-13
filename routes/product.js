import express from "express";
import {adminOnly, isAuthenticated} from "../middlewares/auth.js"
import { addReview, deleteProduct, deleteReview, getAdminProducts, getAllCategories, getAllProducts, getlatestProducts, getSingleProduct, newProduct, updateProduct, updateReview } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
const router = express.Router();

// To create New Product...
router.post("/new", singleUpload, newProduct);
// To get last 10 Products...
router.get("/latest", getlatestProducts);
// To get All unique Categories...
router.get("/categories", getAllCategories);
// To get Admin All Products...
router.get("/admin-products", adminOnly, getAdminProducts);
// To get single Product, update that product and then delete...

// To get all products with filter...(Search All Products...)
router.get("/all", getAllProducts);

router
    .route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);

router
.route("/review/:id")
.post(isAuthenticated, addReview)
.put(isAuthenticated, updateReview)
.delete(isAuthenticated, deleteReview);

export default router;
