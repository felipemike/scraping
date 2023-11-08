const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const cors = require('cors'); // Importe o pacote CORS

const app = express();
const port = 3000;

app.use(express.json());

// Configure o middleware CORS para lidar com a política de mesma origem (CORS)
app.use(cors());

// Rota para a página inicial
app.get('/', (req, res) => {
  // Envia o arquivo index.html localizado na mesma pasta do código
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para realizar a raspagem de dados a partir de uma palavra-chave
app.get('/api/scrape', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      // Retorna um erro 400 se a palavra-chave não for fornecida
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

      // Use Cheerio para extrair dados dos produtos a partir do HTML
      $('.s-result-item').each((index, element) => {
        const title = $(element).find('h2 a').text().trim();
        const rating = $(element).find('.a-icon-star-small .a-icon-alt').text().trim();
        const numReviewsElement = $(element).find('span.a-size-base.s-underline-text');
        const numReviews = numReviewsElement.text().trim();
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
    // Retorna um erro 500 em caso de falha na raspagem
    res.status(500).json({ error: 'O processo de scraping falhou.' });
  }
});

// Rota para verificar o status do servidor
app.get('/api/status', (req, res) => {
  res.send('Servidor está funcionando.');
});

// Middleware para lidar com erros, caso ocorram
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
