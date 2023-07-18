const fs = require('fs');
const path = require('path');

const {validationResult} = require('express-validator/check');

const Category = require('../../models/Category');

exports.getCategories = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
        const totalItems = await Category.find().countDocuments();
        const products = await Category.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched categories successfully.', products: products, totalItems: totalItems
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.createCategory = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name;

    const category = new Category({
        name: name,
    })

    category.save()
        .then(result => {
            res.status(201).json({
                message: 'Category created successfully!',
                category: category,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    Category.findById(categoryId)
        .then(category =>{
            if (!category) {
                const error = new Error('Could not find category.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Product fetched.', category: category });
        }).catch(err =>{
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updateCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const name = req.body.name;
    Category.findById(categoryId)
        .then(category => {
            if (!category) {
                const error = new Error('Could not find category.');
                error.statusCode = 404;
                throw error;
            }
            category.name = name;
            return category.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Category updated!', category: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    Category.findById(categoryId)
        .then(product => {
            if (!product) {
                const error = new Error('Could not find category.');
                error.statusCode = 404;
                throw error;
            }
            return Category.findByIdAndRemove(categoryId);
        })
        .then(result => {
            res.status(200).json({ message: 'Deleted category.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

