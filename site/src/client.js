/**************************************************************************
  HTML elements
**************************************************************************/
const dialog = document.querySelector('dialog');
const openBook = document.getElementById('open-book');
const sideNav = document.getElementById('side-nav');
const navProgress = document.getElementById('nav-progress');
const library = document.getElementById('library');
const about = document.getElementById('about');
const contact = document.getElementById('contact');
const blog = document.getElementById('blog');
const booksInner = document.getElementById('books-inner');
const quotation = document.getElementById('quotation');
const quotationAttribute = document.getElementById('quotation-attribute');
const openBookTitle = document.getElementById('open-book-title');
const openBookPublished = document.getElementById('open-book-published');
const openBookReleased = document.getElementById('open-book-released');
const openBookLink = document.getElementById('open-book-link');
const mainAudio = document.getElementById('main-audio');
const ataAudio = document.getElementById('ata-audio');
const cAudio = document.getElementById('c-audio');
const chaptersList = document.getElementById('chapters-list');
const shareBookBtn = document.getElementById('share-book-btn');
const includeTitlePosition = document.getElementById('include-title-position');

const bookCoversTotal = 5;
const startDate = new Date('2023-07-29');
const dateDelta = getDaysSinceDate(startDate);
const randomSeed = new Math.seedrandom('book-covers-seed');
/**
 * Are we running in the dev env or on the live website?
 */
const isDev = new URL(window.location).origin === 'http://127.0.0.1:5500';

const bookRelativePath = () => isDev ?
    '../site/content/stories/' :
    '../content/stories/';

let sectionsY = [0].concat(...[library, blog, about, contact].map(s => s.offsetTop));
let navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
    .map(n => n.offsetTop);
let heightPerSection = window.innerHeight / (sectionsY.length + 1);

let prevBook = null;
let loadedTime = getUrlParam('time');

/**
 * Convenience wrapper to create HTML elements
 */
class HTMLElementBuilder {
  constructor(
    {
      tag = 'div', 
      text = '', 
      innerHTML = '',
      id = '', 
      classList = [], 
      href = '' ,
      attributes = {},
      styles = {}
    }) {
    this._element = document.createElement(tag);
    this._element.textContent = text;
    if (innerHTML) this._element.innerHTML = innerHTML;
    if (id) this._element.id = id;
    if (classList.length > 0) this._element.classList.add(...classList);
    if (href) this._element.href = href;
    for (const [key, value] of Object.entries(attributes)) {
      this._element.setAttribute(key, value);
    }
    for (const [key, value] of Object.entries(styles)) {
      this._element.style[key] = value;
    }
    return this._element;
  }
}

/**
 * Perform an asyncronous fetch operation on file IO/URL
 * & extract as JSON
 * @param {string} path 
 * @returns {Promise<object>}
 */
async function fetchJSON(path) {
  const res = await fetch(path);
  return await res.json();
}

/**
 * Perform an asyncronous fetch operation on file IO/URL
 * & extract as text
 * @param {string} path 
 * @returns {Promise<string>}
 */
async function fetchText(path) {
  const res = await fetch(path);
  return await res.text();
}

function getDaysSinceDate(targetDate) {
  const currentDate = new Date();
  const utcCurrentDate = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const utcTargetDate = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const timeDifferenceMs = utcCurrentDate - utcTargetDate;
  const daysSince = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
  return daysSince;
}

function updateUrlParam(paramName, paramValue, path) {
  const url = new URL(window.location.href);
  url.searchParams.set(paramName, paramValue);
  if (path) {
    url.pathname = path;
  }
  window.history.pushState(null, '', url);
}

function removeUrlParam(paramName) {
  const url = new URL(window.location.href);
  url.searchParams.delete(paramName);
  window.history.pushState(null, '', url);
}

function getUrlParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

function formatDate(isoDate) {
  const dateObj = new Date(isoDate);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  const getDaySuffix = (day) => {
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
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];
  const formattedDate = `${day}${getDaySuffix(day)} of ${monthNames[month]} ${year}`;
  return formattedDate;
}

/**
 * 
 * @param {string} fmtTime 
 */
function formatTimeToSeconds(fmtTime) {
  const timeBlocks = fmtTime.split('.').map(i => parseInt(i));
  return timeBlocks.reduce((prev, curr, i) => {
    return prev + (curr * (60 ** (timeBlocks.length - 1 - i)))
  }, 0);
}

function recalibrateNav() {
  sectionsY = [0].concat(...[library, blog, about, contact].map(s => s.offsetTop));
  navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
  .map(n => n.offsetTop);
  heightPerSection = window.innerHeight / (sectionsY.length + 1);
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

onresize = () => {
    recalibrateNav();
};

onload = async () => {
  await Promise.all([
    loadBooks(),
    loadQuotations(),
    loadBlogPosts()
  ]);
  recalibrateNav();
}

async function loadBooks() {
  const books = await fetchJSON('content/stories/index.json');
  books.forEach(book => {
    if (book.released || isDev) {
        newBook(book);
    }
  });
  const title = getUrlParam('title');
  if (title) {
    const bookData = books.find(book => book.slug == title);
    bookDisplay(bookData);
  }
}

async function loadQuotations() {
  const quotations = await fetchJSON('content/quotations.json');
  const currentQuotationIndex = dateDelta % quotations.length;
  quotation.textContent = quotations[currentQuotationIndex].text;
  quotationAttribute.textContent = '-' + quotations[currentQuotationIndex].attributed;
}

async function loadBlogPosts() {
  const blogPosts = await fetchJSON('content/blog/index.json');
  for (const post of blogPosts) {
    const postContent = await fetchText(`content/blog/${post.filename}.html`);
    const postDateEl = new HTMLElementBuilder({
      classList: ['text-group', 'blog-date'],
      id: post.filename
    });
    const postDateLink = new HTMLElementBuilder({
      tag: 'a',
      text: formatDate(post.published),
      href: '#' + post.filename,
      classList: ['inline-link']
    });
    const postEl = new HTMLElementBuilder({
      innerHTML: postContent,
      classList: ['text-group', 'blog-post']
    });
    postDateEl.appendChild(postDateLink);
    blog.appendChild(postDateEl);
    blog.appendChild(postEl);
  }
}

shareBookBtn.addEventListener('click', () => {
  if (includeTitlePosition.checked) {
    const trimmedSeconds = Math.round(mainAudio.currentTime);
    updateUrlParam('time', trimmedSeconds);
  } else {
    removeUrlParam('time');
  }
  navigator.clipboard.writeText(window.location);
});

function chapterListener(seconds) {
  mainAudio.currentTime = formatTimeToSeconds(seconds);
}

function loadAudio(bookData, audioEl, fileSuffix='') {
  const audioSource = new HTMLElementBuilder({
    tag: 'source',
    attributes: {
      src: `${bookRelativePath()}${bookData.slug}/${bookData.slug}${fileSuffix}.mp3`
    }
  });
  audioEl.load();
  audioEl.appendChild(audioSource);
}

async function loadBookData(bookData) {
  openBookTitle.textContent = `${bookData.title} by ${bookData.author}`;
  openBookPublished.textContent = `Published ${formatDate(bookData.datePublished)}`;
  openBookReleased.textContent = `Released ${formatDate(bookData.released)}`;
  if (bookData.link) {
    openBookLink.parentNode.style.display = 'inherit';
    openBookLink.href = bookData.link;
  } else {
    openBookLink.parentNode.style.display = 'none';
  }
  const oldSources = document.querySelectorAll('source');
  Array.from(oldSources).forEach(oldSource => {
    if (oldSource) {
      oldSource.parentNode.removeChild(oldSource);
    }
  });
  loadAudio(bookData, mainAudio);
  loadAudio(bookData, ataAudio, '-ata');
  loadAudio(bookData, cAudio, '-c');
  if (loadedTime) {
    mainAudio.currentTime = loadedTime;
    updateUrlParam('time', loadedTime);
  }
  Array.from(chaptersList.children).forEach(child => {
    // TODO: don't think this works exactly
    child.removeEventListener('click', chapterListener);
    chaptersList.removeChild(child);
  });
  const chapters = await fetchText(
    `${bookRelativePath()}${bookData.slug}/${bookData.slug}.csv`
  );
  chapters
    .split('\n')
    .splice(1)
    .map(chapter => chapter.split(','))
    .forEach(chapter => {
      const [title, time] = chapter;
      const chapterEl = new HTMLElementBuilder({
        tag: 'li',
        text: title,
        classList: ['chapter'],
      });
      chapterEl.addEventListener('click', () => chapterListener(time));
      chaptersList.appendChild(chapterEl);
    });
  prevBook = bookData.slug;
}

function bookDisplay(bookData) {
  window.history.pushState(null, '', window.location.origin);
  dialog.showModal();
  if (!isDev) {
    updateUrlParam('title', bookData.slug, 'books');
  }
  if (prevBook !== bookData.slug) {
    loadBookData(bookData);
  }
}

function newBook(bookData) {
    const coverNumber = getSeededNumber(bookCoversTotal);
    const book = new HTMLElementBuilder({
      classList: ['book', `book-cover-${coverNumber}`],
      attributes: {
        'data-slug': bookData.slug,
        'data-author': bookData.author,
        'data-published': bookData.datePublished,
        'data-released': bookData.released
      }
    });
    const bookTitle = new HTMLElementBuilder({
      text: bookData.title,
      classList: ['book-title']
    });
    const bookAuthor = new HTMLElementBuilder({
      text: bookData.author,
      classList: ['book-author']
    });
    const bookImage = new HTMLElementBuilder({
      tag: 'img',
      attributes: {
        src: `./content/stories/${bookData.slug}/${bookData.slug}.jpg`,
        alt: ''
      },
      styles: {
        opacity: 0.5,
        zIndex: 0
      }
    });
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

dialog.addEventListener("close", () => {
  window.history.pushState(null, '', window.location.origin);
  loadedTime = null;
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
