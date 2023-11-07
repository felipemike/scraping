document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const keywordInput = document.getElementById('keyword');
  const resultsContainer = document.getElementById('results-container');

  searchButton.addEventListener('click', () => {
    const keyword = keywordInput.value;
    if (keyword) {
      fetch(`/api/scrape?keyword=${keyword}`)
        .then((response) => response.json())
        .then((data) => {
          resultsContainer.innerHTML = ''; // Limpa qualquer conteúdo anterior

          if (data.length === 0) {
            resultsContainer.innerHTML = 'Nenhum resultado encontrado.';
          } else {
            data.forEach((product) => {
              const productDiv = document.createElement('div');
              productDiv.classList.add('product');

              const title = document.createElement('h2');
              title.textContent = product.title;

              const rating = document.createElement('p');
              rating.textContent = `Rating: ${product.rating}`;

              const numReviews = document.createElement('p');
              numReviews.textContent = `Reviews: ${product.numReviews}`;

              const image = document.createElement('img');
              image.src = product.imageURL;

              productDiv.appendChild(title);
              productDiv.appendChild(rating);
              productDiv.appendChild(numReviews);
              productDiv.appendChild(image);

              resultsContainer.appendChild(productDiv);
            });
          }
        })
        .catch((error) => console.error(error));
    }
  });
});