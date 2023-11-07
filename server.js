// server.js

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/scrape', async (req, res) => {
  try {
    const { keyword } = req.query;
    const amazonURL = `https://www.amazon.com/s?k=${keyword}`;
    const response = await axios.get(amazonURL);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const products = [];

      // Write code to extract product data from the HTML using Cheerio here
      $('.s-result-item').each((index, element) => {
        const title = $(element).find('h2 a').text().trim();
        const rating = $(element).find('.a-icon-star-small .a-icon-alt').text().trim();
        const numReviews = $(element).find('.s-star-rating a').text().trim();
        const imageURL = $(element).find('img').attr('src');

        const product = {
          title,
          rating,
          numReviews,
          imageURL,
        };

        products.push(product);
      });

      res.json(products);
    } else {
      throw new Error('Failed to fetch Amazon search results.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Scraping process failed.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
