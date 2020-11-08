// INIT environment variables
const path = require('path');
const ENV_FILE = path.join(__dirname, 'environments', 'local.env');
require('dotenv').config({ path: ENV_FILE });

const express = require('express');
const routes = require('./routes/urlShotenerRoutes');

const app = express();
const bodyParser = require('body-parser');


// Read  Configurations FROM ENV File
const { PORT } = process.env;

//  Connect all our routes to our application
app.use(bodyParser.json())
app.use('/', routes);


app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`);
});