// express basic http server with view engine ejs

import express from 'express';
import { createServer } from 'http';
import helmet from "helmet";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'cookie-session';
import flash from 'connect-flash';


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
app.use(express.static('./static'));

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
const PORT = 2556;

// Create Server with Port and Error Handling
const server = createServer(app);
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


// Etc

import databse from './shemas/webindex.js';
import cheerio from "cheerio";
import {URL} from "url";
import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs';
class Crawler {
    public toVisit = new Set([
    ]);


    public async Crawler() {
        await this.readFile();

        while (this.toVisit.size > 0) {
            const url = this.toVisit.values().next().value;
            this.toVisit.delete(url);

            const links = await this.crawlPage(url);
            links.forEach(link => {
                try {
                    const nextURL = new URL(link);
                    this.toVisit.add(nextURL.toString());
                } catch {
                    // handle error
                }
            });
        }
    }


    private async readFile() {
        fs.readFile('./file.csv', 'utf-8', (err, data) => {
            if (err) throw err;

            const rows = data.split('\n');

            for (const row of rows) {
                const [number, url] = row.split(',');
                const newUrl = `https://${url}`;
                this.toVisit.add(newUrl);
            }
        });
    }

    private async crawlPage(url: string) {
        try {
            const headers = {
                'User-Agent': 'nonesearch-Web-Crawler NONESEARCH/1.0 (https://github.com/pocketnone/none_search)'
            };
            const proxy = `socks://${process.env.PROXY_SERVER_USERNAME}:${process.env.PROXY_SERVER_PASSWORD}@${process.env.PROXY_SERVER_IP}:${process.env.PROXY_SERVER_PORT}`;
            const agent = new SocksProxyAgent(proxy);
            // Setup HTTPS Proxy
            let response = await axios.get(url, {
                headers: headers,
                httpsAgent: agent
            });
            const origin_url = new URL(url).origin;
            let html = response.data;
            const $ = cheerio.load(html);
            // Saving Memory
            html = null;
            response = null;
            //console.log($("title").text());

            const links = $('a').map((i, el) => {
                let href = $(el).attr('href');
                if(/^https?:\/\//.test(href)) {
                    return href;
                }
            }).get();
            const uniqueLinks = Array.from(new Set([...links, ...(await this.getRobotsTxtLinks(origin_url))]));
            const title = $('title').text() ? $('title').text() : origin_url;
            const description = $('meta[name="description"]').attr('content') ? $('meta[name="description"]').attr('content') : "Unknown";
            const keywords = $('meta[name="keywords"]').attr('content') ? $('meta[name="keywords"]').attr('content') : "Unknown";
            const author = $('meta[name="author"]').attr('content') ? $('meta[name="author"]').attr('content') : "Unknown";
            const icon = $('link[rel="icon"]').attr('href') ? $('link[rel="icon"]').attr('href') : "Unknown";
            const content_preview = $('body').text().split(' ').slice(0, 20).join(' ');

            try{
                await this.index(url, origin_url, title,
                    description, keywords, author, icon,
                    content_preview);
            } catch{
                //console.log(`Error B: ${error}`);
            }
            return uniqueLinks;
        } catch (error) {
            //console.log(`Error B: ${error}`);
            return [];
        }
    }

    private async index(url: string, origin_url: string, title: string, description: string,
                        keywords: string, author: string, icon: string,
                        content_preview: string ) {

        // Check if any value is null
        if (url == null || origin_url == null || title == null || description == null || keywords == null || author == null || icon == null) {
            //console.log('One or more values are null');
            return 0;
        }

        const data = await databse.findOne({url: url});

        if(data) {
            //console.log('Document already exists')
            return 1;
        } else {
            new databse({
                url: url,
                origin_url: origin_url,
                title: title,
                description: description,
                keywords: keywords,
                author: author,
                icon: icon,
                content_preview: content_preview
            }).save().then(() => {});

        }
    }

    private async getRobotsTxtLinks(url: string): Promise<string[]> {
        const headers = {
            'User-Agent': 'nonesearch-Web-Crawler NONESEARCH/1.0 (https://github.com/pocketnone/none_search)'
        };
        const proxy = `socks://${process.env.PROXY_SERVER_USERNAME}:${process.env.PROXY_SERVER_PASSWORD}@${process.env.PROXY_SERVER_IP}:${process.env.PROXY_SERVER_PORT}`;
        const agent = new SocksProxyAgent(proxy);
        const robotsTxtResponse = await axios.get(`${url}/robots.txt`, {
            headers: headers,
            httpsAgent: agent
        });
        const robotsTxtLinks = [];
        const lines = robotsTxtResponse.data.split('\n');
        for (const line of lines) {
            if (line.startsWith('Allow: ')) {
                robotsTxtLinks.push(line.substring('Allow: '.length));
            }
        }
        return robotsTxtLinks;
    }
}



const crawler = new Crawler();
crawler.Crawler().then(() => {
    console.log('Crawler finished');
});
