// INIT environment variables
const path = require('path');
const ENV_FILE = path.join(__dirname, 'environments', 'local.env');
require('dotenv').config({ path: ENV_FILE });

const {logger} = require('./utils/logger');
const express = require('express');
const routes = require('./routes/urlShotenerRoutes');

const app = express();
const bodyParser = require('body-parser');
const {connectMongoDb} = require('./services/mongoDb');



// Read  Configurations FROM ENV File
const { PORT } = process.env;

//  Connect all our routes to our application
app.use(bodyParser.json())
app.use('/', routes);


app.listen(PORT, () => {
  logger.debug(`app listening at http://localhost:${PORT}`);
  
  connectMongoDb().then(() => {
    logger.debug("MongoDb connected");
  }).catch((err) => {
    logger.error("Error in connecting MongoDB", err);
  });

});