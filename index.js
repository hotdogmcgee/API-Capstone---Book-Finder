'use strict';

const apiKeyNYT = '5EbHFVJ0Kq7H1XibGz9LwkMzwt7sxBxi'; 
const nyt_searchURL = 'https://api.nytimes.com/svc/books/v3/lists/overview.json';
const libcloud_searchURL = 'http://api.lib.harvard.edu/v2/items'


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson.results.published_date)
  console.log(responseJson);
  let listData = responseJson.results.lists;
  $('#results-list').empty();
  // iterate through the items array
  //need a way to display each book in each list
  for (let i = 0; i < responseJson.results.lists.length; i++){
    $('#results-list').append(
      `<li><h3>${responseJson.results.published_date}</h3>
      <p>${listData[i].list_name}</p>
      <p>${listData[i].books[0].title}<p>
      </li>`
    )};
    console.log('hello')
  //display the results section  
  $('#results').removeClass('hidden');
};

//uses NYT API to get back list of book results, will be shown on screen 2
function getBooks(query, maxResults=10) {
  const params = {
    published_date: query,
    'api-key': apiKeyNYT,
  };
  const queryString = formatQueryParams(params)
  const url = nyt_searchURL + '?' + queryString;

  console.log(url);


  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}


function showBooks() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const maxResults = $('#js-max-results').val();
    getBooks(searchTerm, maxResults);
  });
}

function showLibResults() {
    //watch for user click, take to new screen showing whether it is available
}

function watchForm() {
    showBooks();
    //showLibResults();
}

$(watchForm);