/**
 * Model class representing short URL to Long url Mapping
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const shortUrlSchema = new Schema({
    urlCode: String,
    originalUrl: String,
    createdAt: { type: Date, default: Date.now },
});

mongoose.model("shortUrl", shortUrlSchema);
