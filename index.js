'use strict';

const apiKeyNYT = '5EbHFVJ0Kq7H1XibGz9LwkMzwt7sxBxi'; 
const nyt_searchURL = 'https://api.nytimes.com/svc/books/v3/lists/overview.json';
const nyt_v2_searchURL = 'https://api.nytimes.com/svc/books/v3/lists.json'
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
    console.log(listData[i].books)
    $('#results-list').append(
      `<p>${responseJson.results.published_date}</p>
      <h2>${listData[i].list_name}</h2>`
    )
    for (let j = 0; j < responseJson.results.lists[i].books.length; j++){
      $('#results-list').append(
        `<li>
        <p>${listData[i].books[j].title}</p>
        <button class="js-lib-click">click here</button>
        </li>`
      )};
  }

    console.log('hello')
  //display the results section  
  $('#results').removeClass('hidden');
  $('#js-error-message').addClass('hidden');
};

//uses NYT API to get back list of book results, will be shown on screen 2
function nytGetBooks(query, genreQuery) {
  const params = {
    published_date: query,
    'api-key': apiKeyNYT,
    list: genreQuery,
  };
  const queryString = formatQueryParams(params)
  const url = nyt_v2_searchURL + '?' + queryString;
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
      console.log(err.message);
    });
}

function libCloudGetBooks(query) {
    const params = {
        published_date: query,
      };
      const queryString = formatQueryParams(params)
      const url = libcloud_searchURL + '?' + queryString;
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
    const searchDate = $('#js-search-date').val();
    const searchTerm = $('#js-search-term').val();
    console.log(searchTerm);
    nytGetBooks(searchDate, searchTerm);
  });
}

function showLibResults() {
    //watch for user click, take to new screen showing whether it is available
    $('#results-list').on('click', '.js-lib-click', function(event) {
        event.preventDefault();
        console.log('yoyoyoy');

    })
}

//point user in correct direction using Library Cloud API
function handleLibCheck() {
    console.log('almost there');
    $('#results-list').empty();
    $('#results-list').append(
        `<li><h3>${responseJson.results.published_date}</h3>
        <p>${listData[i].list_name}</p>
        <p>${listData[i].books[0].title}</p>
        <button class="js-lib-click">click here</button>
        </li>`
      )

};

function watchForm() {
    showBooks();
    showLibResults();
}

$(watchForm);