import express from "express";
import {adminOnly} from "../middlewares/auth.js"
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getlatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
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


export default router;
