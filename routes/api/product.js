const express = require('express');
const { body } = require('express-validator/check');

const ProductController = require('../../controllers/api/ProductController');
const isAuth = require('../../middleware/is-auth');

const router = express.Router();

// GET /products
router.get('/products', isAuth, ProductController.getProducts);

// POST /products
router.post(
    '/products',
    isAuth,
    [
        body('name')
            .trim()
            .isLength({ min: 2 }),
        body('description')
            .trim()
            .isLength({ min: 5 })
    ],
    ProductController.createProduct
);

router.get('/products/:productId', isAuth, ProductController.getProduct);

router.put(
    '/products/:productId',
    isAuth,
    [
        body('name')
            .trim()
            .isLength({ min: 2 }),
        body('description')
            .trim()
            .isLength({ min: 5 })
    ],
    ProductController.updateProduct
);

router.delete('/products/:productId', isAuth, ProductController.deleteProduct);

module.exports = router;
