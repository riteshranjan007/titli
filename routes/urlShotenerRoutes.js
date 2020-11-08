
const { BASE_DOMAIN } = process.env;
const routes = require('express').Router();
const validUrl = require('valid-url');
const {UrlShortenerModel} = require('../models/UrlShortenerModel');
const { logger } = require('../utils/logger');

const model = new UrlShortenerModel();



routes.get('/', (req, res) => {
  res.status(200).json({ message: 'hello!' });
});


routes.get('/:urlcode', async (req, res) => {
    const urlCode = req.params['urlcode'];
    if(!urlCode){
      return res.status(404).json({ message: 'Not found!' });
    }
    const longUrl = await model.getLongUrl(urlCode);
    if(!longUrl){
      return  res.status(404).json({ message: 'Not found!' });
    }
    return res.redirect(301, longUrl);
});

/**
 *  POST request to save long URL
 *  sample Req
 *  body : {
 *        'longUrl':'https://www.example.com'
 *       }
 *  Response - 200
 *  {
 *    'shortUrl':'http://domain/ss2fwf
 *   }
 * 
 */

routes.post('/shorturl', async (req, res) => {

    const body = req.body;
    logger.debug(body);

    if(!body.longUrl){
      return res.status(400).json({ message: 'Invalid Request! longUrl param missing' });
      
    }
    const longUrl = body.longUrl;
    if(!validUrl.isUri(body.longUrl)){
      return res.status(400).json({ message: `Invalid Request! ${longUrl} is not a valid URL`});
    }

    const urlCode = await model.saveShortUrl(longUrl);
    return res.status(200).json({ 
          message: 'success', 
          data : {
            urlCode : urlCode, 
            shortUrl : `${BASE_DOMAIN}/${urlCode}`,
            longUrl: longUrl
          }});
});

/**
 * Get the analytic of number of times a short url have been called in 24hrs, 1 week, and all the time
 * sample Response:
 * {
    "message": "success",
    "data": {
        "totalCount": 37,
        "last30Days": 24,
        "last24Hr": 16
    }
  }
 */

routes.get('/:urlcode/analytics', async(req, res) => {
    const urlCode = req.params['urlcode'];
    const analyticsData = await model.getAnalytics(urlCode);
    
    if(!analyticsData){
      return res.status(404).json({ message: 'Not found!' });
    }

    return res.status(200).json({ 
            message: 'success', 
            data : analyticsData
          });
});
  
module.exports = routes;
