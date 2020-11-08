/**
 * The business logic of saving short to long url mapping and retrieve long url from short url
 */

const {Cache} = require('../services/cache');
const {UrlCodeGenerator} = require('../services/urlCodeGenerator');


class UrlShortenerModel {

    constructor() {
        this.cache = new Cache();
    }


    /**
     * 
     */
    async saveShortUrl(longUrl){
        
        const urlCode = UrlCodeGenerator.getRandomURLCode();
        this.cache.set(urlCode, longUrl);

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

    }

}

module.exports.UrlShortenerModel = UrlShortenerModel;