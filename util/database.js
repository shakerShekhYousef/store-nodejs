const mongoDb = require('mongodb');
const mongoClient = mongoDb.MongoClient;
const mongoUri = require('../constants/database').MONGODB_URI;
let _db;

const mongoConnect = callback => {
    mongoClient.connect(mongoUri)
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if (_db){
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;