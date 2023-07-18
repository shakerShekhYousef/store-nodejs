const express = require('express');
const mongoose = require('mongoose');
const database = require('./util/database')
const MONGODB_URI = require('./constants/database.js').MONGODB_URI;
const authRoutes = require('./routes/api/auth');
const productRoutes = require('./routes/api/product');
const categoryRoutes = require('./routes/api/category');
const port = require('./constants/server').PORT
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require("path");
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null,new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json()); // application/json
app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api',productRoutes);
app.use('/api',categoryRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});

mongoose.connect('mongodb://localhost:27017/perfume')
    .then(result => {
        app.listen(port);
    })
    .catch(err => {
        console.log(err);
    });