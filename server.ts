// express basic http server with view engine ejs

import express from 'express';
import { createServer } from 'http';
import helmet from "helmet";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'cookie-session';
import flash from 'connect-flash';
import { Crawler } from './core/crawler/Crawler.js';


// Set dotenv
import * as dotenv from 'dotenv';
dotenv.config();

// Create Express App
const app = express();

mongoose.set('strictQuery', false);

// Create Mongoose Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.log(err);
});


// Set View Engine ejs
app.set('view engine', 'ejs');

// Set Public Folder
app.use(express.static('static'));

//Set View Folder
app.set('views', 'views');

// Set Helmet
app.use(helmet());
// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set Cookie Parser
app.use(cookieParser());

// Set Flash
app.use(flash());

// Set Session
app.use(session({
    name: 'session',
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
}));

// Set Routes import
import router from './routes/index.js';

// Set Routes
app.use('/', router);

// Set Port
const PORT = process.env.PORT || 3000;

// Create Server with Port and Error Handling
const server = createServer(app);
server.listen(PORT, () => {
    console.log(`Server running on http://localhost${PORT}`);
});



/*
const crawler = new Crawler();
crawler.Crawler().then(() => {
    console.log('Crawler finished');
});
*/