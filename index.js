'use strict';

const apiKeyNYT = '5EbHFVJ0Kq7H1XibGz9LwkMzwt7sxBxi'; 
const listSearchURL = 'https://api.nytimes.com/svc/books/v3/lists.json';
const libCloudSearchURL = 'https://api.lib.harvard.edu/v2/items.json?identifier=';
let globalURL = "";


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//uses NYT API to get back list of book results
function nytGetBooks(date, genreQuery) {
  const params = {
    'published-date': date,
    'api-key': apiKeyNYT,
    list: genreQuery,
  };
  const queryString = formatQueryParams(params)
  const url = listSearchURL + '?' + queryString;

  //setting globalURL for goBack() function
  globalURL = url;

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

function displayNYTResults(responseJson) {
  console.log(responseJson);
  let listData = responseJson.results;
  $('#results-list').empty();
  
  //display each book, published date of list, and a clickable ISBN
  $('#results-list').append(
    `<h2 class="list-title">${listData[0].list_name}</h2>
    <p class="published-date">Published on: ${responseJson.results[0].published_date}</p>`)

    for (let j = 0; j < responseJson.results.length; j++) {
      $('#results-list').append(
        `<li>
          <div class="bookdetails">
            <p>${listData[j].book_details[0].title}</p>
            
            <p> ${listData[j].book_details[0].author}</p>
          </div>
            <button class="book-click">
              <span class="book-click-exact">${listData[j].book_details[0].primary_isbn13}</span>
            </button>
        </li>`
      )};
  
  $('#results').removeClass('hidden');
};

function goBack() {
  fetch(globalURL)
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
      const url = libCloudSearchURL + ISBNRef;
      fetch(url)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(response.statusText);
        })
        .then(responseJson => displayLibResults(responseJson))
        .catch(err => {
          console.log(err.message)
        });
}


//point user in correct direction using Library Cloud API
function displayLibResults(responseJson) {
    $('#results-list').empty();

    //display error if no record found
    if (!responseJson.items) {
      $('#results-list').append(
          `<h2>Could not find that item, please try another.</h2>
          <div class="back-button-div">
            <button class="go-back-button">Go Back</button>
          </div>`
      )
    } else {
      $('#results-list').append(`
          <h2>See if it is available in Harvard's library system!</h2>
          <div class="back-button-div">
            <button class="go-back-button">Go Back</button>
          </div>`
      )
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

    } else if (listData.name.constructor === Array && listData.name[0].hasOwnProperty('namePart')) {
      $('#results-list').append(
        `<p>${listData.name[0].namePart}</p>`)

    } else if (listData.name.constructor === Array && listData.name[0].hasOwnProperty('namePart') && listData.name[0].length > 1) {
      $('#results-list').append(
        `<p>${listData.name[0].namePart[0]}</p>`)

    } else if (listData.name.hasOwnProperty('namePart') && listData.name.namePart.length > 1) {
      $('#results-list').append(
        `<p>${listData.name.namePart[0]}</p>`)
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

function handleNYTBooks() {
  $('form').submit(event => {
    event.preventDefault();
    const searchDate = $('#search-date').val();
    const searchTerm = $('#search-term').val();
    nytGetBooks(searchDate, searchTerm);
  });
}

function handleBookClick() {
  $('#results-list').on('click', '.book-click', function(event) {
      event.preventDefault();
      const ISBNRef = $(event.target).text();
      libCloudGetBooks(ISBNRef);
  })
}

function handleGoBack() {
  $('#results-list').on('click', '.go-back-button', function(event) {
    goBack(event);
  })
};

function handleScroll() {
  $('#results-list').on('click', '.book-click', function(e) {
    window.scrollTo(0, 550);
  })
}

function watchForm() {
    handleNYTBooks();
    handleBookClick();
    handleGoBack()
    handleScroll()
}

$(watchForm);