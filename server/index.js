const express = require('express');
const morgan = require('morgan');

const port = 6246;

const app = express();

app.use(morgan('tiny'));
app.use(express.json());

app.use('/', require('./routes'));

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
