/**
 * Entry point of Cron Job to generate random codes to be used by Shortener Service 
 * - This cron runs at regular interval and makes sure there are at least N number of code 
 * - Min Free code and Run interval is configurable
 */

const path = require('path');
const ENV_FILE = path.join(__dirname, 'environments', 'local.env');

// Load the configuration file
require('dotenv').config({ path: ENV_FILE });

const {CODE_GENERATOR_CRON_SCHEDULE} =  process.env;

var CronJob = require('cron').CronJob;
const {logger} = require('./utils/logger');
const {connectMongoDb} = require('./services/mongoDb');

connectMongoDb().then(() => {
    logger.debug("MongoDb connected");
}).catch((err) => {
    logger.error("Error in connecting MongoDB", err);
});


const {CodeGeneratorService} = require('./services/codeGeneratorService');
const codeGeneratorService = new CodeGeneratorService();
// Bootstrap
let codeGenerated = codeGeneratorService.checkAndGenerateCode();

var job = new CronJob(CODE_GENERATOR_CRON_SCHEDULE, async() => {
    logger.debug('Waking up to generate code');
    let codeGenerated = await codeGeneratorService.checkAndGenerateCode();
    logger.debug(`Code generated ${codeGenerated}`);
});
  
job.start();



