/**
 * Convenience class to create HTML elements
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
    }

    get element() {
        return this._element
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

const randomSeed = new Math.seedrandom('book-covers-seed');

function getSeededNumber(limit) {
    const newRandom = randomSeed().toString().slice(2);
    for (const c of newRandom) {
        if (parseInt(c) <= limit) {
        return c;
        }
    }
    return "1";
}
  
function getDaysSinceDate(targetDate) {
    const currentDate = new Date();
    const utcCurrentDate = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const utcTargetDate = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const timeDifferenceMs = utcCurrentDate - utcTargetDate;
    const daysSince = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
    return daysSince;
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

/**
 * Are we running in the dev env or on the live website?
 */
const isDev = new URL(window.location).origin === 'http://127.0.0.1:5500';

const bookRelativePath = () => isDev ?
    '../site/content/stories/' :
    '../content/stories/';

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
      

export {
    HTMLElementBuilder,
    fetchJSON,
    fetchText,
    getSeededNumber,
    getDaysSinceDate,
    formatDate,
    formatTimeToSeconds,
    isDev,
    bookRelativePath,
    updateUrlParam,
    removeUrlParam,
    getUrlParam
};
