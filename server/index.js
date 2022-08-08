require('dotenv').config();
require('newrelic');
const express = require('express');
// const morgan = require('morgan');
const path = require('path');

const port = 6246;

const app = express();

// app.use(morgan('tiny'));
app.use(express.json());

app.get('/loader*', (req, res) => { res.sendFile(path.join(__dirname, '..', 'loader.txt')); });

app.use('/', require('./routes'));

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

module.exports = app;
