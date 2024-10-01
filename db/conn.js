const mongoose = require('mongoose')
require('dotenv').config();
const DB_URL = process.env.DB_URL

mongoose.set('strictQuery', true);

const connectDB = () => {
    return mongoose.connect(DB_URL, {
    })
};

module.exports = connectDB