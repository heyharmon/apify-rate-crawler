import { CheerioCrawler, Dataset } from 'crawlee';
// import { router } from './routes.js';

const startUrls = ['https://scraper-testing-site.netlify.app'];

const crawler = new CheerioCrawler({
    // requestHandler: router,

    async requestHandler({ $, request, enqueueLinks }) {
        const title = $('title').text();
        console.log(`Crawling ${title} at "${request.url}".`);

        // Gather rates

        // Store rates
        await Dataset.pushData({
            url: request.loadedUrl,
            title,
        });

        // Add other found links to queue
        await enqueueLinks({
            strategy: 'same-domain',
            transformRequestFunction(req) {
                // ignore all links ending with `.pdf`
                if (req.url.endsWith('.pdf')) return false;
                return req;
            },
        });
    }
});

await crawler.run(startUrls);
