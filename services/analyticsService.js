

const ShortUrlView = require("../models/shortUrlView");
const { logger } = require('../utils/logger');


class AnalyticsService {

    constructor() {
    }

    async trackUrlView(urlCode) {
        let timeStamp = new Date();
        timeStamp.setMinutes(0);
        timeStamp.setSeconds(0);
        timeStamp.setMilliseconds(0);

        let query = {urlCode: urlCode, timeStamp: timeStamp};
        const update = {
            $inc: {'count': 1 }
        }
        const options = { upsert: true};

        try{
            await ShortUrlView.findOneAndUpdate(query, update, options).exec();
        }catch(err){
            logger.error("Error in updating view for urlCode");
        }

    }

    async getTotalViews(urlCode){
        const totalCount = await ShortUrlView.aggregate([
            {
                $match : {urlCode : urlCode}
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]);
          let count =0;
          if(totalCount && totalCount.length > 0){
            count = totalCount[0].count;
          }
          return count;
    }

    async getLastNDaysCount(urlCode, days){
        const totalCount = await ShortUrlView.aggregate([
            {
                $match : {   
                    urlCode : urlCode,
                    timeStamp : {'$gt':new Date(Date.now() - days*24*60*60 * 1000) }
                }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]);
        
          let count =0;
          if(totalCount && totalCount.length > 0){
            count = totalCount[0].count;
          }

          return count;
    }
}

module.exports.AnalyticsService = AnalyticsService;