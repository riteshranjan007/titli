
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
      res.status(404).json({ message: 'Not found!' });
    }
    const longUrl = await model.getLongUrl(urlCode);
    if(!longUrl){
      res.status(404).json({ message: 'Not found!' });
    }
    res.redirect(301, longUrl);
    // Analytics tracking

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
    res.status(200).json({ 
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
 *  '24hr': 23,
 *  'week': 
 * }
 */

routes.get('/:urlId/analytics', (req, res) => {
  
  
});
  
module.exports = routes;
