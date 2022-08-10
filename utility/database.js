const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback) =>{
    MongoClient.connect('mongodb://localhost/node-app')
        .then(client =>{
            console.log('connected');
            _db = client.db();
            callback();
        })
        .catch(err =>{
            console.log(err);
            throw err;
        })
}

const getdb = () =>{
    if(_db){
        return _db;
    }
    throw 'No DataBASE'
}

exports.mongoConnect= mongoConnect;
exports.getdb = getdb;