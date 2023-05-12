const { runActor } = require('@apify/scraper-tools');
const CrawlerSetup = require('./crawler_setup');

runActor(CrawlerSetup);
