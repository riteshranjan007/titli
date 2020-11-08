const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shortUrlViewSchema = new Schema({
    urlCode: String,
    timeStamp: { type: Date},
    count: Number
});

shortUrlViewSchema.index({ urlCode: 1, timeStamp: -1 }); // index

const ShortUrlView = mongoose.model('ShortUrlView', shortUrlViewSchema);



module.exports = ShortUrlView;
