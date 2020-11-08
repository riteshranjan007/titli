/**
 * The business logic of saving short to long url mapping and retrieve long url from short url
 */

const {Cache} = require('../services/cache');
const { logger } = require('../utils/logger');
const ShortUrl = require("../models/shortUrl");
const {AnalyticsService} = require('../services/analyticsService');
const {CodeGeneratorService} = require('../services/CodeGeneratorService');

class UrlShortenerModel {

    constructor() {
        this.cache = new Cache();
        this.analyticsService = new AnalyticsService();
        this.codeGeneratorService = new CodeGeneratorService();
        this.codeDoc = {count:0};
        this.codeIndex=0;
    }

    /**
     *  Save 
     */
    async saveShortUrl(longUrl){
        
        const urlCode = await this.getURLCode();

        const shortUrl  = new ShortUrl({
            _id : urlCode,
            urlCode: urlCode,
            originalUrl: longUrl
        });
        
        try{
            await shortUrl.save();
        }catch(err){
            logger.error(`Error in Saving short URL ${longUrl}`, err);
            return;
        }
        
        this.cache.set(urlCode, longUrl);

        return urlCode;
    }

    /**
     * Return long url from short Url code
     * @param {The short url Code} shortUrl 
     */
    async getLongUrl(urlCode){
        let longURl = await this.cache.get(urlCode);
        if(longURl){
            // Update analytics
            this.analyticsService.trackUrlView(urlCode);
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
        // Update analytics
        this.analyticsService.trackUrlView(urlCode);
        return doc.originalUrl;
        
    }

    async getAnalytics(urlCode){
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
        
        const totalCount = await this.analyticsService.getTotalViews(urlCode);
        const monthCount = await this.analyticsService.getLastNDaysCount(urlCode, 30);
        const dayCount = await this.analyticsService.getLastNDaysCount(urlCode, 1);

        return {
            totalCount: totalCount,
            last30Days:monthCount,
            last24Hr:dayCount
        };
    }

    async getURLCode(){
        if(this.codeIndex == this.codeDoc.count){
            this.codeDoc = await this.codeGeneratorService.getNextAvailableCodes();
            this.codeIndex = 0;
        }

        return this.codeDoc.urlCodes[this.codeIndex++];
    }
}

module.exports.UrlShortenerModel = UrlShortenerModel;