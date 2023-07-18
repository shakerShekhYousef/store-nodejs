const fs = require('fs');
const path = require('path');

const {validationResult} = require('express-validator/check');

const Product = require('../../models/Product');
const Category = require('../../models/Category');

exports.getProducts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
        const totalItems = await Product.find().countDocuments();
        const products = await Product.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched products successfully.', products: products, totalItems: totalItems
        });

    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const categoryId = req.body.categoryId;

    const product = new Product({
        name: name,
        price: price,
        description: description,
        imageUrl: imageUrl,
        categoryId: categoryId
    })

    product.save()
        .then(result => {
            return Category.findById(categoryId);
        })
        .then(category => {
            category.products.push(product);
            return category.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Product created successfully!',
                product: product,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                const error = new Error('Could not find product.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Product fetched.', product: product});
        }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updateProduct = (req, res, next) => {
    const productId = req.params.productId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    let imageUrl = req.body.image;
    const category = req.body.categoryId;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    Product.findById(productId)
        .then(product => {
            if (!product) {
                const error = new Error('Could not find product.');
                error.statusCode = 404;
                throw error;
            }
            if (imageUrl !== product.imageUrl) {
                clearImage(product.imageUrl);
            }
            product.name = name;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = price;
            product.category = category;
            return product.save();
        })
        .then(result => {
            res.status(200).json({message: 'Product updated!', product: result});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                const error = new Error('Could not find product.');
                error.statusCode = 404;
                throw error;
            }
            // Check logged in user
            clearImage(product.imageUrl);
            return Product.findByIdAndRemove(productId);
        })
        .then(result => {
            res.status(200).json({message: 'Deleted product.'});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

