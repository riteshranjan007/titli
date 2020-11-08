/**
 * Wrapper over mongo db
 */
const { MONGO_DB_URL } = process.env;

const mongoose = require("mongoose");

const options = {
    useNewUrlParser : true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
};

const connectMongoDb = () => {
 return mongoose.connect(MONGO_DB_URL, options);
};

module.exports.connectMongoDb = connectMongoDb;
