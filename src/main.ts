import { Actor } from 'apify';
import { CheerioCrawler, Dataset } from 'crawlee'
import * as htmlparser from 'htmlparser2'

const startUrls = ['https://scraper-testing-site.netlify.app/rates/']

await Actor.main(async () => {
    const crawler = new CheerioCrawler({
        async requestHandler({ $, request, enqueueLinks }) {
            const title = $('title').text()
            console.log(`Crawling ${title} at "${request.url}".`)

            // Parse all parts of the DOM
            let parts = []
            let parser = new htmlparser.Parser({
                onopentag: function (name, attributes) { parts.push(' ') },
                ontext: function (text) { parts.push(text) },
                onclosetag: function (tagName) { parts.push(' ') }
            },{ decodeEntities: true })
            parser.write($('html').html())
            parser.end()
            
            // Clean up page content
            // Join the parts and replace all occurrences of 2 or more spaces with a single space.
            let content = parts.join(' ').replace(/\ {2,}/g, ' ')

            // Setup a regex for finding rates
            // Decimal and % required.
            const regex = /\d+\.\d+%/g

            // Find rates in the content
            let rates = []
            let matches = content.match(regex)
            if (matches) rates.push(...matches)

            // Store rates
            await Dataset.pushData({
                url: request.loadedUrl,
                title,
                rates,
            })

            // Add other found links to queue
            await enqueueLinks({
                strategy: 'same-domain',
                transformRequestFunction(req) {
                    // ignore all links ending with `.pdf`
                    if (req.url.endsWith('.pdf')) return false
                    return req
                },
            })
        }
    })

    // Enqueue the initial request and run the crawler
    await crawler.run(startUrls)
});
