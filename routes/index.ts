// Express Route Setup
import express from 'express';
import index from  '../shemas/webindex.js';
import {Configuration, OpenAIApi} from 'openai';


const router = express.Router();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.get('/', (req, res) => {

    index.countDocuments({}, (err, count) => {
        if(err) {
            console.error(err);
        } else {
            return res.render('index', {
                count
            });
        }
    });
});


router.post('/search', async (req, res) => {
   const { search } = req.body;
    if(!search) {
        res.redirect('/');
    } else {
        res.redirect(`/search/${search}`);
    }
});


router.get('/search/:term', async (req, res) => {
    const { term } = req.params;
    // check if term null or undefined
    if(!term) {
        res.redirect('/');
    }

    const search = encodeURIComponent(term);

    var ChatGPTAwenser = 'NONE';
    var nextPage;

    if(search.endsWith('?')) {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: search,
            temperature: 0.9,
            max_tokens: 1000,
            stream: false,
        });
        ChatGPTAwenser = completion.data.choices[0].text.replace('?', "");
    }
    const seachtTerm = search.replace('?', "").split(' ');
    index.find({
        $or: [
            { url: { $regex: new RegExp(seachtTerm.join("|"), "i") } },
            { title: { $regex: new RegExp(seachtTerm.join("|"), "i") } },
            { description: { $regex: new RegExp(seachtTerm.join("|"), "i") } },
            { keywords: { $regex: new RegExp(seachtTerm.join("|"), "i")} }
        ]
    })
        .sort({webpage_offical: -1, webpage_flagged: 1})
        .limit(50).exec(
        (err, results) => {
            if (err) {
                console.error(err);
            } else {
                if(results.length > 50) {
                    nextPage = true;
                }
                res.render('results_view', {
                    results,
                    ChatGPTAwenser,
                    nextPage,
                    term
                });
            }
        });
})


router.get('/search/:term/:page', (req, res) => {
    // Get params
    const { term, page } = req.params;
    // check if term null or undefined
    if(!term) {
        res.redirect('/');
    }
    // check if page null or undefined
    if(!page) {
        res.redirect(`/search/${term}`);
    }
    // check if page is not a number
    if(isNaN(page)) {
        res.redirect(`/search/${term}`);
    }
    // check if page is lower than 1
    if(page < 1) {
        res.redirect(`/search/${term}`);
    }

    const search = encodeURIComponent(term);
    const page_number = parseInt(page);
    const itemsPerPage = 50;
    const skip = (page_number - 1) * itemsPerPage;

    var resultlist;
    var nextPage;
    var addPage = page + 1;
    const oldPage = page - 1;
    const seachtTerm = search.replace('?', "").split(' ');
    index.find({
        $or: [
            { url: { $regex: new RegExp(seachtTerm.join("|"), "i") } },
            { title: { $regex: new RegExp(seachtTerm.join("|"), "i") } },
            { description: { $regex: new RegExp(seachtTerm.join("|"), "i") } },
            { keywords: { $regex: new RegExp(seachtTerm.join("|"), "i")} }
        ]
    }).sort({webpage_flagged: 1})
        .skip(skip).limit(50).exec(
        (err, results) => {
            if (err) {
                console.error(err);
            } else {
                if(results.length > itemsPerPage) {
                    nextPage = true;
                }

                return res.render('results_view_pages', {
                    results,
                    nextPage,
                    search,
                    searchterm: term,
                    serchpage: page,
                    addPage,
                    oldPage
                });
            }
        });


})

// export router
export default router;