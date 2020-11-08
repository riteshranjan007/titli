/**
 * This is run as Key generator Cron Job 
 * Key generator makes 
 */
const UrlCode = require('../models/urlCode');
const { MIN_FREE_CODES, CODES_PER_DOC } = process.env;
const {UrlCodeGenerator} = require('../services/urlCodeGenerator');
const { logger } = require('../utils/logger');

class CodeGeneratorService {

    /**
     * Generate code, check for duplicate and saves in persistence layer to be consumed\
     * Return: Number of docs created, and number of codes generated.
     */
    async checkAndGenerateCode(){
        
        // Check free codes counts
        const freeCodeDocsCount = await this.getFreeCodeDocCount();
        
        logger.debug(`freeCodeDocsCount = ${freeCodeDocsCount}`);

        if(freeCodeDocsCount >= MIN_FREE_CODES){
            logger.debug(`No codes generated as enough free codes`);
            return;
        }
        
        logger.debug(`Starting code generation`);

        let codeDocCount= await this.getDocumentsCount();
        let docs = [];

        for(let i=0;i<MIN_FREE_CODES;i++){
            let codes = this.getCodes(CODES_PER_DOC);

            let urlCode = new UrlCode({
                seq: codeDocCount + i + 1,
                urlCodes: codes,
                count: codes.length,
                used: 0 
            });
            docs.push(urlCode);
        } 
        
        try {
            await UrlCode.insertMany(docs);
        } catch(err){
            logger.error("Error while save UrlCode", err);
            return;
        }
        return docs.length;
    }

    getCodes(count){
        let codes = [];
        for(let i=0;i<count; i++){
            codes.push(UrlCodeGenerator.getRandomURLCode());
        }

        return codes;
    }

    async getDocumentsCount(){

        const totalCount = await UrlCode.aggregate([
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

    async getFreeCodeDocCount(){

        const totalCount = await UrlCode.aggregate([
            {
                $match : {used : false}
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]);  

        let count=0;
        if(totalCount && totalCount.length > 0){
        count = totalCount[0].count;
        }
        return count;
    }
    


    /**
     * Marks code as used and return it to be consumed
     */
    async getNextAvailableCodes(){
        let query = {used: false};
        const update = {used : true};
        const options = { upsert: true, new: true  };

        try{
            return await UrlCode.findOneAndUpdate(query, update, options).exec();
        }catch(err){
            logger.error("Error in updating view for urlCode");
        }

    }


}


module.exports.CodeGeneratorService = CodeGeneratorService;