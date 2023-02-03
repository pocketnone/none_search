// Web-crawler for the web crawler project
import databse from '../../shemas/webindex.js';
import cheerio from "cheerio";
import {URL} from "url";
import axios from 'axios';
export class Crawler {
    public async Crawler() {
        const toVisit = new Set([
            "https://moz.com/top500",
            "https://www.spotify.com/",
            "https://www.tiktok.com/",
            "https://www.twitter.com/",
            "https://www.wikipedia.org/",
            "https://www.yahoo.com/",
            "https://www.youtube.com/",
            "https://www.discord.com/"
        ]);

        while (toVisit.size > 0) {
            const url = toVisit.values().next().value;
            toVisit.delete(url);
            console.log(`Crawling ${url}`);
            const links = await Crawler.crawlPage(url);
            for (const link of links) {
                try{
                    const nextURL = new URL(link);
                    toVisit.add(nextURL.toString());
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    private static async crawlPage(url: string) {
        try {
            const headers = {
                'User-Agent': 'nonesearch-Web-Crawler NONESEARCH/1.0 (https://github.com/pocketnone/none_search)'
            };
            let response = await axios.get(url, {headers});
            const origin_url = new URL(url).origin;
            let html = response.data;
            const $ = cheerio.load(html);
            // Saving Memory
            html = null;
            response = null;
            console.log($("title").text());

            const links = $('a').map((i, el) => $(el).attr('href')).get();;
            const uniqueLinks = Array.from(new Set([...links, ...(await Crawler.getRobotsTxtLinks(origin_url))]));
            const title = $('title').text() ? $('title').text() : origin_url;
            const description = $('meta[name="description"]').attr('content') ? $('meta[name="description"]').attr('content') : "Unknown";
            const keywords = $('meta[name="keywords"]').attr('content') ? $('meta[name="keywords"]').attr('content') : "Unknown";
            const author = $('meta[name="author"]').attr('content') ? $('meta[name="author"]').attr('content') : "Unknown";
            const icon = $('link[rel="icon"]').attr('href') ? $('link[rel="icon"]').attr('href') : "Unknown";
            const content_preview = $('body').text().split(' ').slice(0, 20).join(' ');

            try{
                await Crawler.index(url, origin_url, title,
                    description, keywords, author, icon,
                    content_preview);
            } catch (error) {
                console.log(`Error B: ${error}`);
            }
            return uniqueLinks;
        } catch (error) {
            console.log(`Error B: ${error}`);
            return [];
        }
    }



    private static async index(url: string, origin_url: string, title: string, description: string,
          keywords: string, author: string, icon: string,
          content_preview: string ) {

        // Check if any value is null
        if (url == null || origin_url == null || title == null || description == null || keywords == null || author == null || icon == null) {
            console.log('One or more values are null');
            return 0;
        }

       const data = await databse.findOne({url: url});

        if(data) {
            console.log('Document already exists')
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
            }).save().then(() => console.log('New document created'));
        }
    }

   private static async getRobotsTxtLinks(url: string): Promise<string[]> {
       const headers = {
           'User-Agent': 'nonesearch-Web-Crawler NONESEARCH/1.0 (https://github.com/pocketnone/none_search)'
       };
        const robotsTxtResponse = await axios.get(`${url}/robots.txt`, {headers});
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