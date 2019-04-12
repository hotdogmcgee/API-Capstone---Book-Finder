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
  console.log(responseJson.results[0].published_date)
  console.log(responseJson);
  let listData = responseJson.results;
  $('.js-results-header').text('Pick the book you want to find')
  $('#results-list').empty();
  
  //display each book, published date of list, and a clickable ISBN
  $('#results-list').append(
    `<p>Published on: ${responseJson.results[0].published_date}</p>
    <h2>${listData[0].list_name}</h2>`)

    for (let j = 0; j < responseJson.results.length; j++){
      $('#results-list').append(
        `<li>
          <div class="bookandbutton">
            <p>${listData[j].book_details[0].title}</p>
            
            <p> ${listData[j].book_details[0].author}</p>
            <button class="js-lib-click">
              <span class="js-lib-click-exact">${listData[j].book_details[0].primary_isbn13}</span>
            </button>
          </div>
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
      $('#js-error-message').removeClass('hidden');
      $('#js-error-message').text(`Something went wrong, please try a different date`);
    });
}

function libCloudGetBooks(ISBNRef) {
      const url = libcloud_searchURL + ISBNRef
      console.log(url);
      $('#js-error-message').removeClass('hidden')

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
        const ISBNRef = $(event.target).text();
        console.log(ISBNRef);
        libCloudGetBooks(ISBNRef);
    })
}

//point user in correct direction using Library Cloud API
function displayLibResults(responseJson) {
    $('.js-results-header').text("See if it is available in Harvard's library system!")
    $('#results-list').empty();

    //display error if no record found
    if (!responseJson.items) {
      $('#results-list').append(
        `<h3>Could not find that item, please try another</h3>`
      )
      console.log('no record')
    } else {
      $('#js-error-message').empty();
    }

    const listData = responseJson.items.mods;

    //title
    if (listData.titleInfo.hasOwnProperty('nonSort')) {
      $('#results-list').append(
       `<h3>${listData.titleInfo.nonSort} ${listData.titleInfo.title}</h3>`)
    }
     else if (listData.titleInfo.constructor === Array && listData.titleInfo[0].hasOwnProperty('title')) {
       if (listData.titleInfo[0].hasOwnProperty('nonSort')) {
          $('#results-list').append(
          `<h3>${listData.titleInfo[0].nonSort} ${listData.titleInfo[0].title}`)
        } else {
        $('#results-list').append(
          `<h3>${listData.titleInfo[0].title}`)
      }
    } 
     else if (listData.titleInfo.hasOwnProperty('title')) {
      $('#results-list').append(
        `<h3>${listData.titleInfo.title}</h3>`)
    } else {
      $('#results-list').append(
      ` <h3>something</h3>`)
    }
    
    //description
    if (listData.abstract.hasOwnProperty('#text')) {
      $('#results-list').append(
      `<p class="book-description">${listData.abstract['#text']}</p>`)
    } else if (listData.abstract[0].hasOwnProperty('#text')) {
      $('#results-list').append(
        `<p class="book-description">${listData.abstract[0]['#text']}</p>`)
    }

    //author
    if (listData.name.constructor != Array && listData.name.namePart.constructor != Array && listData.name.hasOwnProperty('namePart')) {
      $('#results-list').append(
        `<p>${listData.name.namePart}</p>`)
      console.log(1)

    } else if (listData.name.constructor === Array && listData.name[0].hasOwnProperty('namePart')) {
      $('#results-list').append(
        `<p>${listData.name[0].namePart}</p>`)
      console.log(2)

    } else if (listData.name.constructor === Array && listData.name[0].hasOwnProperty('namePart') && listData.name[0].length > 1) {
      $('#results-list').append(
        `<p>${listData.name[0].namePart[0]}</p>`)
      console.log(3)

    } else if (listData.name.hasOwnProperty('namePart') && listData.name.namePart.length > 1) {
      $('#results-list').append(
        `<p>${listData.name.namePart[0]}</p>`)
      console.log(4)
    }
    
    //shelf location
      if (listData.location && listData.location[0].shelfLocator) {
         $('#results-list').append(
          `<p>${listData.location[0].shelfLocator}</p>`)
      } else {
        $('#results-list').append(
          `<p>Not currently available.</p>`)
      }

     for (let i = 0; i < listData.originInfo.length; i++) {
        if (listData.originInfo[i].hasOwnProperty('publisher')) {
        $('#results-list').append(
          `<p>${listData.originInfo[i].publisher} ${listData.originInfo[i].dateIssued}</p>`)
        }
     }

    for (let i = 0; i < listData.location.length; i++) {
      if (listData.location[i] && listData.location[i].physicalLocation.hasOwnProperty('#text')) {
      $('#results-list').append(
        `<p>${listData.location[i].physicalLocation['#text']}</p>`)
      }
    }
};


//SCROLL TO REGION WHEN BOOK IS CLICKED
function handleScroll() {
  $('#results-list').on('click', '.js-lib-click', function(e) {
    window.scrollTo(0, 300);
    console.log('scroll ran')
  })
}

function watchForm() {
    handleNYTBooks();
    handleBookClick();
    handleScroll()
}

$(watchForm);