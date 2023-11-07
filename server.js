const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/scrape', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: 'A palavra-chave é obrigatória.' });
    }
    const amazonURL = `https://www.amazon.com/s?k=${keyword}`;
    const response = await axios.get(amazonURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/webkit-version (KHTML, like Gecko) Silk/browser-version like Chrome/chrome-version Safari/webkit-version',
      },
    });

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

      if (products.length === 0) {
        return res.json({ message: 'Nenhum resultado encontrado.' });
      }

      res.json(products);
    } else {
      throw new Error('Failed to fetch Amazon search results.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'O processo de scraping falhou.' });
  }
});

app.get('/api/status', (req, res) => {
  res.send('Servidor está funcionando.');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
