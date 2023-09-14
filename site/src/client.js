const dialog = document.querySelector('dialog');
const openBook = document.getElementById('open-book');
const sideNav = document.getElementById('side-nav');
const navProgress = document.getElementById('nav-progress');
const library = document.getElementById('library');
const about = document.getElementById('about');
const contact = document.getElementById('contact');
const credits = document.getElementById('credits');
const booksInner = document.getElementById('books-inner');
const quotation = document.getElementById('quotation');
const quotationAttribute = document.getElementById('quotation-attribute');
const openBookTitle = document.getElementById('open-book-title');
const openBookPublished = document.getElementById('open-book-published');
const mainAudio = document.getElementById('main-audio');

const bookCoversTotal = 5;
const startDate = new Date('2023-07-29');
const dateDelta = getDaysSinceDate(startDate);
const randomSeed = new Math.seedrandom('book-covers-seed');


let sectionsY = [0].concat(...[library, about, credits, contact].map(s => s.offsetTop));
let navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
    .map(n => n.offsetTop);
let heightPerSection = window.innerHeight / (sectionsY.length + 1);

function getDaysSinceDate(targetDate) {
  // Get the current date
  const currentDate = new Date();

  // Convert both dates to UTC to avoid issues with daylight saving time
  const utcCurrentDate = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const utcTargetDate = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  // Calculate the difference in milliseconds between the two dates
  const timeDifferenceMs = utcCurrentDate - utcTargetDate;

  // Convert milliseconds to days (1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  const daysSince = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));

  return daysSince;
}

function recalibrateNav() {
    sectionsY = [0].concat(...[library, about, credits, contact].map(s => s.offsetTop));
    navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
        .map(n => n.offsetTop);
    heightPerSection = window.innerHeight / (sectionsY.length + 1);
}

onresize = (_) => {
    recalibrateNav();
};

fetch('content/stories/index.json')
  .then(response => response.json())
  .then(books => {
    books.forEach(book => {
        if (book.released) {
            newBook(book);
        }
    });
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    if (title) {
      const bookData = books.find(book => book.slug == title);
      bookDisplay(bookData);
}
    recalibrateNav();
  })
  .catch(error => {
    console.error('Error:', error);
  });

  fetch('content/quotations.json')
  .then(response => response.json())
  .then(quotations => {
    const currentQuotationIndex = dateDelta % quotations.length;
    quotation.textContent = quotations[currentQuotationIndex].text;
    quotationAttribute.textContent = '-' + quotations[currentQuotationIndex].attributed;
  })
  .catch(error => {
    console.error('Error:', error);
  });

function updateUrlParam(paramName, paramValue, path) {
  const url = new URL(window.location.href);
  url.searchParams.set(paramName, paramValue);
  if (path) {
    url.pathname = path;
  }
  window.history.pushState(null, '', url);
}

function formatDate(isoDate) {
  const dateObj = new Date(isoDate);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  // Function to get the day suffix (st, nd, rd, th)
  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  // Array of month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  // Assemble the formatted string
  const formattedDate = `${day}${getDaySuffix(day)} of ${monthNames[month]} ${year}`;
  return formattedDate;
}

function bookDisplay(bookData) {
  dialog.showModal();
  updateUrlParam('title', bookData.slug, 'books');
  openBookTitle.textContent = `${bookData.title} by ${bookData.author}`;
  openBookPublished.textContent = `Published ${formatDate(bookData.datePublished)}`;
  const audioSource = document.createElement('source');
  audioSource.src = `../site/content/stories/${bookData.slug}/${bookData.slug}.mp3`;
  mainAudio.appendChild(audioSource);
}

function getSeededNumber(limit) {
  const newRandom = randomSeed().toString().slice(2);
  for (const c of newRandom) {
    if (parseInt(c) <= limit) {
      return c;
    }
  }
  return "1";
}

function newBook(bookData) {
    const book = document.createElement("div");
    book.setAttribute('data-slug', bookData.slug);
    book.setAttribute('data-author', bookData.author);
    book.setAttribute('data-published', bookData.datePublished);
    book.setAttribute('data-released', bookData.released);
    const coverNumber = getSeededNumber(bookCoversTotal);
    book.className = `book book-cover-${coverNumber}`;
    const bookTitle = document.createElement("div");
    bookTitle.className = 'book-title';
    bookTitle.textContent = bookData.title;
    const bookAuthor = document.createElement("div");
    bookAuthor.className = 'book-author';
    bookAuthor.textContent = bookData.author;
    const bookImage = document.createElement("img");
    bookImage.src = `./content/stories/${bookData.slug}/${bookData.slug}.jpg`;
    bookImage.alt = '';
    bookImage.style.opacity = 0.5;
    bookImage.style.zIndex = 0;
    book.appendChild(bookTitle);
    book.appendChild(bookAuthor);
    book.appendChild(bookImage);
    booksInner.appendChild(book);
    book.addEventListener('click', _ => {
      bookDisplay(bookData);
    });
}

dialog.addEventListener("click", e => {
    const dialogDimensions = dialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      dialog.close();
    }
});

dialog.addEventListener("close", e => {
  window.history.pushState(null, '', window.location.origin);
});


document.addEventListener('scroll', _ => {
    if (scrollY < 120) {
        sideNav.style.display = 'none';
        return;
    }
    sideNav.style.display = 'flex';
    const calcOpacity =  0 + (scrollY - 120) / 250;
    sideNav.style.opacity = Math.max(Math.min(calcOpacity, 0.9), 0);
    const nextSectionIdx = sectionsY.findIndex(s => scrollY < s);
    const nextSection = sectionsY[nextSectionIdx];
    const currSection = scrollY < sectionsY[0] ? 0 : sectionsY[nextSectionIdx-1];
    const scrollSectionHeight = nextSection - currSection;
    const scrollProgress = scrollY - currSection;
    const scrollPercent = parseFloat((scrollProgress / scrollSectionHeight).toFixed(2));
    const nextNav = navLinksY[nextSectionIdx];
    const currNav = navLinksY[nextSectionIdx-1];
    const scrollNavHeight = nextNav - currNav;
    const navCurrProgress = scrollNavHeight * scrollPercent;
    const navCurrPosition = currNav + navCurrProgress - 8;
    navProgress.style.top = `${navCurrPosition}px`;
    Array.from(document.querySelectorAll('.side-nav-item')).forEach((n, i) => {
        if ((Math.abs(navCurrPosition + 3 - n.offsetTop) < 22 ||
                isNaN(navCurrPosition) && i == 4) || i == 0) {
            n.querySelector('a').style.color = 'black';
        } else {
            n.querySelector('a').style.color = 'white';
        }
    })
});
