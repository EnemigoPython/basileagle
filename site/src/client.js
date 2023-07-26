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

let sectionsY = [0].concat(...[library, about, credits, contact].map(s => s.offsetTop));
let navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
    .map(n => n.offsetTop);
let heightPerSection = window.innerHeight / (sectionsY.length + 1);
let currentBook;

const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');
if (title) {
  const url = new URL(window.location.href);
  url.pathname = 'books';
  window.history.pushState(null, '', url);
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
    console.log(books);
    books.forEach(book => {
        if (book.released) {
            newBook(book);
        }
    });
    recalibrateNav();
  })
  .catch(error => {
    console.error('Error:', error);
  });

  fetch('content/quotations.json')
  .then(response => response.json())
  .then(quotations => {
    quotation.textContent = quotations[0].text;
    quotationAttribute.textContent = '-' + quotations[0].attributed;
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

function newBook(bookData) {
    const book = document.createElement("div");
    book.className = 'book';
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
        currentBook = bookData;
        dialog.showModal();
        updateUrlParam('title', bookData.slug, 'books');
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
