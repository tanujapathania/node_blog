require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path')
const http = require('http')
const app = express()
const multer = require("multer");

const connectDB = require('./db/conn')
const registerRoutes = require('./routes/registerRoutes')
const blogRoutes = require('./routes/blogRoutes')

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

app.use(express.json())
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

app.use("/api/user", registerRoutes);
app.use("/api/post", blogRoutes);

//connect to the databse and start the server
app.use(function (request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb();
        };
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb();
        };
    }
    next();
})

const DB_URL = process.env.DB_URL

const start = async () => {
    console.log("Starting ", DB_URL);
    try {
        await connectDB(DB_URL);
        server.listen(PORT, () => {
            console.log(`Server is listening on ${PORT}`);
        });
    } catch (error) {
        console.log(error)
    }
};

start(process.env.DATABASE)