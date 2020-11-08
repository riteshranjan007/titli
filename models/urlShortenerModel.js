/**
 * The business logic of saving short to long url mapping and retrieve long url from short url
 */

const {Cache} = require('../services/cache');
const {UrlCodeGenerator} = require('../services/urlCodeGenerator');
const { logger } = require('../utils/logger');

const ShortUrl = require("../models/shortUrl");

class UrlShortenerModel {

    constructor() {
        this.cache = new Cache();
    }

    /**
     *  Save 
     */
    async saveShortUrl(longUrl){
        
        const urlCode = UrlCodeGenerator.getRandomURLCode();
        this.cache.set(urlCode, longUrl);

        const shortUrl  = new ShortUrl({
            _id : urlCode,
            urlCode: urlCode,
            originalUrl: longUrl
        });
        
        shortUrl.save((err,document)=>{
            if(err) console.log(err)
            console.log(document)
          })

        return urlCode;
    }

    /**
     * Return long url from short Url code
     * @param {The short url Code} shortUrl 
     */
    async getLongUrl(urlCode){
        let longURl = this.cache.get(urlCode);
        if(longURl){
            return longURl;
        }
        // If not found in cache try finding in MongoDB
        let doc = {};
        try{
            doc = await ShortUrl.findOne({_id: urlCode}).exec();
        } catch(err){
            logger.error(`Error in finding long URL by urlCode ${urlCode}`, err);
            return;
        }
        if(!doc || !doc.originalUrl){
            return;
        }
        // Save into cache
        this.cache.set(urlCode, doc.originalUrl);
        return doc.originalUrl;
        
    }
}

module.exports.UrlShortenerModel = UrlShortenerModel;