const dialog = document.querySelector('dialog');
const openBook = document.getElementById('open-book');
const sideNav = document.getElementById('side-nav');
const navProgress = document.getElementById('nav-progress');
const library = document.getElementById('library');
const about = document.getElementById('about');
const contact = document.getElementById('contact');
const credits = document.getElementById('credits');

let sectionsY = [0].concat(...[library, about, credits, contact].map(s => s.offsetTop));
let navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
    .map(n => n.offsetTop);
let heightPerSection = window.innerHeight / (sectionsY.length + 1);

onresize = (_) => {
    sectionsY = [0].concat(...[library, about, credits, contact].map(s => s.offsetTop));
    navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
        .map(n => n.offsetTop);
    heightPerSection = window.innerHeight / (sectionsY.length + 1);
};

fetch('content/stories/index.json')
  .then(response => response.json())
  .then(data => {
    // Do something with the loaded JSON data
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

document.querySelectorAll('.book').forEach(book => {
    book.addEventListener('click', _ => {
        dialog.showModal();
    });
});

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

// async function getData() {
//     const res = await fetch("server.php?action=storyText");
//     console.log(res);
//     return await res.json()
// }

// window.onload = async () => {
//     let someData = await getData();
//     console.log(someData);
// };

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
        if (Math.abs(navCurrPosition + 3 - n.offsetTop) < 22 ||
                isNaN(navCurrPosition) && i == 4) {
            n.querySelector('a').style.color = 'black';
        } else {
            n.querySelector('a').style.color = 'white';
        }
    })
});
