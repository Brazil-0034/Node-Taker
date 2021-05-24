

const Discord = require('discord.js');
const client = new Discord.Client();

//execution handler
const exec = require('child_process');

//summarization tools
const SummarizerManager = require("node-summarizer").SummarizerManager;
var Readability = require('@mozilla/readability');
var request = require('request');

//scraper tools
const jsdom = require("jsdom");
const JSDOM = jsdom;

//scrape data cleanup tool
const htmlToText = require('html-to-text');

client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', msg => {
    if (msg.content.substring(0, 2) == '!t')
    {
        var args = msg.content.slice(2).trim().split(' ');

        request(args[0], function (err, response, body)
        {
            //init
            var doc = new JSDOM(body, {url:args[0]});

            let reader = new Readability(doc.window.document);
            let article = reader.parse();
            
            //hey let's grab some things
            const text = htmlToText(article.content, {
                wordwrap:130,
                limits:
                {
                    maxDepth : 5
                },
                tags: {
                    'img' : {format: 'skip'}
                }
                
            });

            //let's clean up the things

            let Summarizer = new SummarizerManager(text, 8);

            let reduced = "**__" + article.title + "__**\n\n - ";

            let articleContent = Summarizer.getSummaryByRank().then((summary_object)=>{
               articleContent = summary_object.summary;

               articleContent = articleContent.replace(/\n/g, '');
               articleContent = articleContent.replace(/\./g, '\n - ');
               reduced += articleContent;

               //rmv last line (??????)

               reduced = reduced.replace(/\n.*$/, '');

               //hopefully no exception
               //but may add reduced = reduced.substring(0,2000);
               //if PDF

               msg.reply(reduced);
            });
        });
    }
});

client.login(tkn);

