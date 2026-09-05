const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();
const controller = require('./controller/app');
const connectDB = require('./models/db'); // Line 8

connectDB(); // Line 10


const app = express();

app.use(express.json());

app.use(helmet());

app.use(cors());

app.use(morgan('dev'));

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
