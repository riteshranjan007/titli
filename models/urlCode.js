/**
 * The class represents URL Codes pre generated.
 * Each document consists of N short code which is in bulk consumed 
 * by a node process
 * Default size in each document is 100.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UrlCodeSchema = new Schema({
    _id : String,
    seq: Number,
    urlCodes: [String],
    count: Number,
    used: Boolean 
});

UrlCodeSchema.index({ used: 1, seq : -1}); // index
const UrlCode = mongoose.model('UrlCode', UrlCodeSchema);

module.exports = UrlCode;
