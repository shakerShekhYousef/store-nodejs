const express = require('express');
const { body } = require('express-validator/check');

const CategoryController = require('../../controllers/api/CategoryController');
const isAuth = require('../../middleware/is-auth');

const router = express.Router();

// GET /categories
router.get('/categories', isAuth, CategoryController.getCategories);

// POST /categories
router.post(
    '/categories',
    isAuth,
    [
        body('name')
            .trim()
            .isLength({ min: 2 }),
    ],
    CategoryController.createCategory
);

router.get('/categories/:categoryId', isAuth, CategoryController.getCategory);

router.put(
    '/categories/:categoryId',
    isAuth,
    [
        body('name')
            .trim()
            .isLength({ min: 2 }),
    ],
    CategoryController.updateCategory
);

router.delete('/categories/:categoryId', isAuth, CategoryController.deleteCategory);

module.exports = router;
