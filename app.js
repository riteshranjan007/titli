const express = require('express');
const path = require('path');
const app = express();

const ENV_FILE = path.join(__dirname, 'environments', 'local.env');
require('dotenv').config({ path: ENV_FILE });

// READ FROM ENV File
const { PORT } = process.env;

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.get('/:urlId', (req, res) => {
    let urlId = req.params['urlId'];
    console.log(`urlId = ${urlId}`);
    res.send('Hello World!');
  });


app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`);
});