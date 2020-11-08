/**
 * Model class representing short URL to Long url Mapping
 * 
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shortUrlSchema = new Schema({
    _id : String,
    urlCode: String,
    originalUrl: String,
    createdAt: { type: Date, default: Date.now },
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

module.exports = ShortUrl;
