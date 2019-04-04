'use strict';

//let ISBNRef;
const apiKeyNYT = '5EbHFVJ0Kq7H1XibGz9LwkMzwt7sxBxi'; 
const nyt_searchURL = 'https://api.nytimes.com/svc/books/v3/lists/overview.json';
const nyt_v2_searchURL = 'https://api.nytimes.com/svc/books/v3/lists.json'
const libcloud_searchURL = 'https://api.lib.harvard.edu/v2/items.json?identifier='



function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayNYTResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson.results[0].published_date)
  console.log(responseJson);
  let listData = responseJson.results;
  $('.js-results-header').text('Pick the book you want to find')
  $('#results-list').empty();
  // iterate through the items array
  //need a way to display each book in each list
  $('#results-list').append(
    `<p>${responseJson.results[0].published_date}</p>
    <h2>${listData[0].list_name}</h2>`
  )
    for (let j = 0; j < responseJson.results.length; j++){
      $('#results-list').append(
        `<li>
        <p>${listData[j].book_details[0].title}</p>
        <button class="js-lib-click">
          <span class="js-lib-click-exact">${listData[j].book_details[0].primary_isbn13}</span>
          </button>
        </li>`
      )};
  

    console.log('hello')
  //display the results section  
  $('#results').removeClass('hidden');
  $('#js-error-message').addClass('hidden');
};

//uses NYT API to get back list of book results, will be shown on screen 2
function nytGetBooks(query, genreQuery) {
  const params = {
    'published-date': query,
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
    .then(responseJson => displayNYTResults(responseJson))
    .catch(err => {
      console.log(err.message);
    });
}

function libCloudGetBooks(ISBNRef) {
      const url = libcloud_searchURL + ISBNRef
      console.log(url);
      console.log(ISBNRef);
    
      fetch(url)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(response.statusText);
        })
        .then(responseJson => displayLibResults(responseJson))
        .catch(err => {
          $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}


function handleNYTBooks() {
  $('form').submit(event => {
    event.preventDefault();
    const searchDate = $('#js-search-date').val();
    const searchTerm = $('#js-search-term').val();
    console.log(searchTerm);
    nytGetBooks(searchDate, searchTerm);
  });
}

function handleBookClick() {
    //watch for user click, take to new screen showing whether it is available
    $('#results-list').on('click', '.js-lib-click', function(event) {
        event.preventDefault();
        console.log('yoyoyoy');
        const ISBNRef = $(event.target).text();
        console.log(ISBNRef);
        libCloudGetBooks(ISBNRef);

    })
}

//point user in correct direction using Library Cloud API
function displayLibResults(responseJson) {
    console.log('almost there');
    const listData = responseJson.items.mods;
    console.log(listData);
    $('.js-results-header').text('Find it here!')
    $('#results-list').empty();
    $('#results-list').append(
        `<li><h3>${listData.titleInfo.nonSort} ${listData.titleInfo.title}</h3>
       
        <p>${listData.name.namePart[0]}</p>
        <p>${listData.location[0].shelfLocator}</p>
        </li>`
      )
      // for (let i = 0; i < listData.classification.length; i++) {
      //   $('#results-list').append(
      //     `<p>${listData.classification[i].authority}</p>
      //      <p>${listData.classification[i].content}</p>
      //     `
      //   )
      // }
          


};

function watchForm() {
    handleNYTBooks();
    handleBookClick();
}

$(watchForm);