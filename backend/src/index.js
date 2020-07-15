const express = require ('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(require('./routers/models'));

// express application
app.listen(4000, '0.0.0.0');
console.log('Server on port 4000: connected');
